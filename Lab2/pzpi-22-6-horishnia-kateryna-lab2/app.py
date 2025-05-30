import glob
import json
import shutil
import ssl
import subprocess
from base64 import b64decode
from datetime import datetime, UTC, date, timedelta
from os import environ
from pathlib import Path
from time import time

import bcrypt
import jwt
from flask import send_file, request
from flask_cors import CORS
from flask_mqtt import Mqtt
from flask_openapi3 import OpenAPI
from pyfcm import FCMNotification
from sqlalchemy import create_engine, extract, desc
from sqlalchemy.orm import sessionmaker

from errors import NotAuthorizedError
from models import ModelsBase, User, UserSession, IotDevice, DeviceConfiguration, DeviceSchedule, DeviceReport, FcmToken
from request_models import RegisterRequest, UserDevicesQuery, DeviceCreateRequest, AuthHeaders, DeviceEditRequest, \
    DeviceConfigEditRequest, DevicePath, DeviceScheduleAddRequest, SchedulePath, DeviceReportsQuery, \
    DeviceReportRequest, PaginationQuery, UserPath, EditUserRequest, LoginRequest, FcmTokenRequest

app = OpenAPI(__name__, doc_prefix="/docs")
JWT_EXPIRE_TIME = 60 * 60 * 24
JWT_KEY = b64decode(environ["JWT_KEY"])
app.config["MQTT_BROKER_URL"] = environ["MQTT_HOST"]
app.config["MQTT_BROKER_PORT"] = int(environ["MQTT_PORT"])
app.config["MQTT_USERNAME"] = environ["MQTT_USER"]
app.config["MQTT_PASSWORD"] = environ["MQTT_PASSWORD"]
app.config["MQTT_KEEPALIVE"] = 60
app.config["MQTT_TLS_ENABLED"] = True
app.config["MQTT_TLS_INSECURE"] = False
app.config["MQTT_TLS_VERSION"] = ssl.PROTOCOL_TLSv1_2
CORS(app)

mqtt = Mqtt(app)

engine = create_engine(environ["DATABASE"])
ModelsBase.metadata.create_all(engine)
DBSession = sessionmaker(engine)
session = DBSession()

fcm = FCMNotification(service_account_file="apz-a51ed-firebase-adminsdk-fbsvc-0e80eec747.json")

POWER_CONSUMPTION = 5  # In watts
BACKUPS_DIR = Path(environ.get("BACKUPS_DIR", "./backups"))
BACKUPS_DIR.mkdir(parents=True, exist_ok=True)


@mqtt.on_connect()
def handle_mqtt_connect(client, userdata, flags, rc):
    mqtt.subscribe("lights-reports")


@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    try:
        payload = json.loads(message.payload)
    except ValueError:
        return

    if message.topic != "lights-reports":
        return

    if "enabled" not in payload or "enabled_for" not in payload or "token" not in payload:
        return

    if not isinstance(payload["enabled"], bool) or not isinstance(payload["enabled_for"], (int, type(None))):
        return

    try:
        device = auth_device(payload["token"])
    except NotAuthorizedError:
        return

    report = DeviceReport(
        device=device, time=datetime.now(UTC), enabled=payload["enabled"],
        enabled_for=payload["enabled_for"] if not payload["enabled"] else None
    )
    session.add(report)
    session.commit()

    fcm_title = f"Device {'enabled' if payload['enabled'] else 'disabled'}"
    fcm_body = f"Device {device.name} was {'enabled' if payload['enabled'] else 'disabled'}."
    if not payload["enabled"]:
        fcm_body += f"It was enabled for {payload['enabled_for']} seconds"

    for token in session.query(FcmToken).filter_by(user=device.user).order_by(desc(FcmToken.id)).limit(10):
        fcm.notify(
            fcm_token=token.fcm_token,
            notification_title=fcm_title,
            notification_body=fcm_body,
        )


@app.errorhandler(NotAuthorizedError)
def handle_not_authorized(_):
    return {"error": "Not authorized!"}, 401


def auth_user(token: str) -> User:
    token = jwt.decode(token, JWT_KEY, algorithms=["HS256"])
    user = session.query(User).filter_by(id=token["user"]).join(UserSession) \
        .filter(UserSession.id == token["session"]).scalar()
    if user is None:
        raise NotAuthorizedError

    return user


def auth_admin(token: str) -> User:
    user = auth_user(token)
    if not user.is_admin:
        raise NotAuthorizedError

    return user


def auth_device(token: str) -> IotDevice:
    try:
        device_id, key = token.split(".")
        device_id = int(device_id)
    except ValueError:
        raise NotAuthorizedError

    device = session.query(IotDevice).filter_by(id=device_id, api_key=key)\
        .join(DeviceConfiguration).join(IotDevice.user).scalar()
    if device is None:
        raise NotAuthorizedError

    return device


@app.post("/api/auth/register")
def register(body: RegisterRequest):
    if session.query(User).filter_by(email=body.email).scalar() is not None:
        return {"error": "User with this email already exists!"}, 400

    password_hash = bcrypt.hashpw(body.password.encode("utf8"), bcrypt.gensalt()).decode("utf8")
    user = User(
        email=body.email, password=password_hash, first_name=body.first_name, last_name=body.last_name,
        is_admin=body.is_admin,
    )
    user_session = UserSession(user=user)
    session.add(user)
    session.add(user_session)
    session.commit()

    return {
        "token": jwt.encode({
            "user": user.id,
            "session": user_session.id,
            "exp": int(time() + JWT_EXPIRE_TIME)
        }, JWT_KEY)
    }


@app.post("/api/auth/login")
def login(body: LoginRequest):
    user = session.query(User).filter_by(email=body.email).scalar()
    if user is None:
        return {"error": "User with this credentials does not exist!"}, 400

    if not bcrypt.checkpw(body.password.encode("utf8"), user.password.encode("utf8")):
        return {"error": "User with this credentials does not exist!"}, 400

    user_session = UserSession(user=user)
    session.add(user_session)
    session.commit()

    return {
        "token": jwt.encode({
            "user": user.id,
            "session": user_session.id,
            "exp": int(time() + JWT_EXPIRE_TIME)
        }, JWT_KEY, algorithm="HS256")
    }


@app.get("/api/user")
def get_user(header: AuthHeaders):
    user = auth_user(header.token)
    return user.to_json()


@app.post("/api/fcm")
def save_fcm_token(body: FcmTokenRequest, header: AuthHeaders):
    user = auth_user(header.token)

    token = FcmToken(user=user, fcm_token=body.fcm_token, last_active_at=datetime.now(UTC))
    session.add(token)
    session.commit()

    return "", 204


@app.get("/api/devices")
def get_user_devices(query: UserDevicesQuery, header: AuthHeaders):
    user = auth_user(header.token)

    query_ = session.query(IotDevice).filter_by(user=user).join(DeviceConfiguration)

    count = query_.count()
    query_ = query_.limit(query.page_size).offset((query.page - 1) * query.page_size)

    return {
        "count": count,
        "result": [device.to_json() for device in query_.all()],
    }


@app.post("/api/devices")
def create_device(body: DeviceCreateRequest, header: AuthHeaders):
    user = auth_user(header.token)

    device = IotDevice(user=user, name=body.name)
    config = DeviceConfiguration(device=device, electricity_price=body.electricity_price)
    session.add(device)
    session.add(config)
    session.commit()

    return device.to_json()


@app.get("/api/devices/<int:device_id>")
def get_device(path: DevicePath, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    return device.to_json()


@app.patch("/api/devices/<int:device_id>")
def edit_device(path: DevicePath, body: DeviceEditRequest, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    if body.name:
        device.name = body.name
        session.commit()

    return device.to_json()


@app.patch("/api/devices/<int:device_id>/config")
def edit_device_config(path: DevicePath, body: DeviceConfigEditRequest, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    if body.enabled_manually is not None:
        device.configuration.enabled = body.enabled_manually
    if body.enabled_auto is not None:
        device.configuration.enabled_auto = body.enabled_auto
    if body.electricity_price is not None:
        device.configuration.electricity_price = body.electricity_price

    if body.enabled_manually is not None or body.enabled_auto is not None or body.electricity_price is not None:
        session.commit()

    mqtt.publish(f"config/{device.id}.{device.api_key}", json.dumps(device.configuration.to_json()).encode("utf8"))
    return device.to_json()


@app.delete("/api/devices/<int:device_id>")
def delete_device(path: DevicePath, header: AuthHeaders):
    user = auth_user(header.token)

    session.query(IotDevice).filter_by(id=path.device_id, user=user).delete()

    return "", 204


@app.get("/api/devices/<int:device_id>/schedule")
def get_device_schedule(path: DevicePath, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    schedule_items = session.query(DeviceSchedule).filter_by(device=device).order_by("start_hour").all()

    return [schedule.to_json() for schedule in schedule_items]


@app.post("/api/devices/<int:device_id>/schedule")
def add_device_schedule_item(path: DevicePath, body: DeviceScheduleAddRequest, header: AuthHeaders):
    if body.start_hour >= body.end_hour:
        return {"error": "End hour cannot be less than start hour!"}, 400

    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    schedule = DeviceSchedule(device=device, start_hour=body.start_hour, end_hour=body.end_hour)
    session.add(schedule)
    session.commit()

    mqtt.publish(f"schedule/{device.id}.{device.api_key}", json.dumps({
        "action": "add",
        **schedule.to_json(),
    }).encode("utf8"))

    return schedule.to_json()


@app.delete("/api/devices/<int:device_id>/schedule/<int:schedule_id>")
def delete_device_schedule_item(path: SchedulePath, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    session.query(DeviceSchedule).filter_by(device=device, id=path.schedule_id).delete()
    mqtt.publish(f"schedule/{device.id}.{device.api_key}", json.dumps({
        "action": "refetch",
    }).encode("utf8"))

    return "", 204


@app.get("/api/devices/<int:device_id>/reports")
def get_device_reports(path: DevicePath, query: DeviceReportsQuery, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()
    query_ = session.query(DeviceReport).filter_by(device=device).order_by("time")

    count = query_.count()
    query_ = query_.limit(query.page_size).offset((query.page - 1) * query.page_size)

    return {
        "count": count,
        "result": [report.to_json() for report in query_.all()],
    }


@app.get("/api/devices/<int:device_id>/analytics")
def get_device_analytics(path: DevicePath, header: AuthHeaders):
    user = auth_user(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id, user=user).join(DeviceConfiguration).scalar()

    base_query = session.query(DeviceReport.enabled_for)\
        .filter_by(device=device).filter(DeviceReport.enabled_for != None)

    this_month = base_query.filter(extract("month", DeviceReport.time) == date.today().month)
    last_28_days = base_query.filter(DeviceReport.time > (date.today() - timedelta(days=28)))

    this_month_count = this_month.count()
    last_28_days_count = last_28_days.count()
    this_month_enabled_time = sum(*zip(*this_month.all()))
    last_28_days_enabled_time = sum(*zip(*last_28_days.all()))

    _1_HOUR = 60 * 60

    this_month_electricity_consumption = this_month_enabled_time / _1_HOUR * POWER_CONSUMPTION
    last_28_days_electricity_consumption = last_28_days_enabled_time / _1_HOUR * POWER_CONSUMPTION

    return {
        "this_month": {
            "enable_count": this_month_count,
            "total_enabled_time": this_month_enabled_time,
            "average_enabled_time": int(this_month_enabled_time / this_month_count) if this_month_count else 0,
            "electricity_consumption": this_month_electricity_consumption,
            "electricity_price": this_month_electricity_consumption / 1000 * device.configuration.electricity_price,
        },
        "last_28_days": {
            "enable_count": last_28_days_count,
            "total_enabled_time": last_28_days_enabled_time,
            "average_enabled_time": int(last_28_days_enabled_time / last_28_days_count) if last_28_days_count else 0,
            "electricity_consumption": last_28_days_electricity_consumption,
            "electricity_price": last_28_days_electricity_consumption / 1000 * device.configuration.electricity_price,
        }
    }


@app.get("/api/device/config")
def get_device_config(header: AuthHeaders):
    device = auth_device(header.token)
    return device.configuration.to_json()


@app.get("/api/device/schedule")
def get_device_schedule_(header: AuthHeaders):
    device = auth_device(header.token)
    schedule_items = session.query(DeviceSchedule).filter_by(device=device).order_by("start_hour").all()
    return [schedule.to_json() for schedule in schedule_items]


@app.post("/api/device/report")
def report_device_state(body: DeviceReportRequest, header: AuthHeaders):
    device = auth_device(header.token)

    report = DeviceReport(
        device=device, time=datetime.now(UTC), enabled=body.enabled,
        enabled_for=body.was_enabled_for if not body.enabled else None
    )
    session.add(report)
    session.commit()

    return "", 204


@app.get("/api/admin/users")
def admin_get_users(query: PaginationQuery, header: AuthHeaders):
    auth_admin(header.token)

    query_ = session.query(User).order_by("id")

    count = query_.count()
    query_ = query_.limit(query.page_size).offset((query.page - 1) * query.page_size)

    return {
        "count": count,
        "result": [user.to_json() for user in query_.all()],
    }


@app.get("/api/admin/users/<int:user_id>")
def admin_get_user(path: UserPath, header: AuthHeaders):
    auth_admin(header.token)

    user = session.query(User).filter_by(id=path.user_id).scalar()
    if user is None:
        return {"error": "Unknown user!"}, 404

    return user.to_json()


@app.patch("/api/admin/users/<int:user_id>")
def admin_edit_user(path: UserPath, body: EditUserRequest, header: AuthHeaders):
    auth_admin(header.token)

    user = session.query(User).filter_by(id=path.user_id).scalar()
    if user is None:
        return {"error": "Unknown user!"}, 404

    if body.email is not None:
        user.email = body.email
    if body.password is not None:
        user.password = bcrypt.hashpw(body.password.encode("utf8"), bcrypt.gensalt())
    if body.first_name is not None:
        user.first_name = body.first_name
    if body.last_name is not None:
        user.last_name = body.last_name
    if body.is_admin is not None:
        user.is_admin = body.is_admin

    if body.email is not None or body.password is not None or body.first_name is not None \
            or body.last_name is not None or body.is_admin is not None:
        session.commit()

    return user.to_json()


@app.delete("/api/admin/users/<int:user_id>")
def admin_delete_user(path: UserPath, header: AuthHeaders):
    auth_admin(header.token)

    session.query(User).filter_by(id=path.user_id).delete()
    return "", 204


@app.get("/api/admin/devices")
def admin_get_devices(query: PaginationQuery, header: AuthHeaders):
    auth_admin(header.token)

    query_ = session.query(IotDevice).order_by("id")

    count = query_.count()
    query_ = query_.limit(query.page_size).offset((query.page - 1) * query.page_size)

    return {
        "count": count,
        "result": [device.to_json(True) for device in query_.all()],
    }


@app.get("/api/admin/devices/<int:device_id>")
def admin_get_device(path: DevicePath, header: AuthHeaders):
    auth_admin(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    return device.to_json(True)


@app.patch("/api/admin/devices/<int:device_id>")
def admin_edit_device(path: DevicePath, body: DeviceEditRequest, header: AuthHeaders):
    auth_admin(header.token)

    device = session.query(IotDevice).filter_by(id=path.device_id).scalar()
    if device is None:
        return {"error": "Unknown device!"}, 404

    if body.name is not None:
        device.name = body.name

    if body.name is not None:
        session.commit()

    return device.to_json(True)


@app.delete("/api/admin/devices/<int:device_id>")
def admin_delete_device(path: DevicePath, header: AuthHeaders):
    auth_admin(header.token)

    session.query(IotDevice).filter_by(id=path.device_id).delete()
    return "", 204


@app.get("/api/admin/system/backups")
def list_backups(header: AuthHeaders):
    auth_admin(header.token)

    db_uri = environ["DATABASE"]
    backup_prefix = db_uri.split("://")[0]

    backups = glob.glob(f"{BACKUPS_DIR}/{backup_prefix}_*.bak", recursive=False, include_hidden=False)
    backups = sorted(backups, reverse=True)
    backups = map(lambda path: str(Path(path).relative_to(BACKUPS_DIR)), backups)
    backups = list(backups)

    return backups


@app.post("/api/admin/system/backups")
def create_backup(header: AuthHeaders):
    auth_admin(header.token)

    db_uri = environ["DATABASE"]
    backup_prefix = db_uri.split("://")[0]
    backup_name = datetime.now(UTC).strftime("%d%m%Y-%H%M%S")
    backup_file = f"{backup_prefix}_{backup_name}.bak"

    if db_uri.startswith("sqlite:///"):
        db_path = db_uri.replace("sqlite:///", "")
        shutil.copy2(db_path, BACKUPS_DIR / backup_file)
    elif db_uri.startswith("postgresql://"):
        parsed = db_uri.replace("postgresql://", "")
        user_pass, host_db = parsed.split("@")
        user, password = user_pass.split(":")
        host, dbname = host_db.split("/")

        dump_env = environ.copy()
        dump_env["PGPASSWORD"] = password

        cmd = ["pg_dump", "-U", user, "-h", host, "-F", "c", "-f", str(BACKUPS_DIR / backup_file), dbname]
        subprocess.run(cmd, check=True, env=dump_env)
    else:
        return {"error": "Unsupported database type"}, 400

    return "", 204


@app.route("/api/admin/system/backups/<string:filename>", methods=["GET"])
def download_backup(filename: str):
    auth_admin(request.headers.get("token", ""))

    if "/" in filename or "\\" in filename:
        return {"error": "Unknown backup"}, 404

    path = BACKUPS_DIR / filename
    if not path.exists():
        return {"error": "Unknown backup"}, 404

    return send_file(path, as_attachment=True)


@app.route("/api/admin/system/backups/<string:filename>", methods=["DELETE"])
def delete_backup(filename: str):
    auth_admin(request.headers.get("token", ""))

    if "/" in filename or "\\" in filename:
        return {"error": "Unknown backup"}, 404

    path = BACKUPS_DIR / filename
    if not path.exists():
        return {"error": "Unknown backup"}, 404

    path.unlink(missing_ok=True)
    return "", 204


@app.route("/api/admin/system/backups/<string:filename>/restore", methods=["POST"])
def restore_backup(filename: str):
    auth_admin(request.headers.get("token", ""))

    if "/" in filename or "\\" in filename:
        return {"error": "Unknown backup"}, 404

    db_uri = environ["DATABASE"]
    backup_prefix = db_uri.split("://")[0]
    backup_file = f"{backup_prefix}_{filename.split('_')[1]}"
    backup_path = BACKUPS_DIR / backup_file

    if not backup_path.exists():
        return {"error": "Unknown backup"}, 404

    if db_uri.startswith("sqlite:///"):
        db_path = db_uri.replace("sqlite:///", "")
        shutil.copy2(backup_path, db_path)

    elif db_uri.startswith("postgresql://"):
        parsed = db_uri.replace("postgresql://", "")
        user_pass, host_db = parsed.split("@")
        user, password = user_pass.split(":")
        host, dbname = host_db.split("/")

        dump_env = environ.copy()
        dump_env["PGPASSWORD"] = password

        user_host = ["-U", user, "-h", host]
        subprocess.run(["dropdb", *user_host, dbname], check=True, env=dump_env)
        subprocess.run(["createdb", *user_host, dbname], check=True, env=dump_env)
        subprocess.run(["pg_restore", *user_host, "-d", dbname, str(backup_path)], check=True, env=dump_env)
    else:
        return {"error": "Unsupported database type"}, 400

    return "", 204



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9090, debug=False)
