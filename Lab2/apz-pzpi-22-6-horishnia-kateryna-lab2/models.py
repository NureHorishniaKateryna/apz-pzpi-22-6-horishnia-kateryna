from __future__ import annotations

from datetime import datetime
from os import urandom

from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

ModelsBase = declarative_base()


def gen_device_api_key() -> str:
    return urandom(16).hex()


class User(ModelsBase):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True)
    email: str = Column(String(255), nullable=False, unique=True)
    password: str = Column(String(64), nullable=False)
    first_name: str = Column(String(64), nullable=False)
    last_name: str = Column(String(64), nullable=False)
    is_admin: bool = Column(Boolean, default=False)

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "is_admin": self.is_admin,
        }


class UserSession(ModelsBase):
    __tablename__ = "sessions"

    id: int = Column(Integer, primary_key=True)
    user_id: int = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")


class IotDevice(ModelsBase):
    __tablename__ = "iot_devices"

    id: int = Column(Integer, primary_key=True)
    user_id: int = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")
    name: str = Column(String(64), nullable=False)
    api_key: str = Column(String(32), nullable=False, default=gen_device_api_key)
    configuration = relationship("DeviceConfiguration", uselist=False, back_populates="device")

    def to_json(self, for_admin: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "api_key": f"{self.id}.{self.api_key}",
            "configuration": self.configuration.to_json(),
        }

        if for_admin:
            data["user"] = self.user.to_json()
        else:
            data["user_id"] = self.user_id

        return data


class DeviceConfiguration(ModelsBase):
    __tablename__ = "device_configurations"

    id: int = Column(Integer, primary_key=True)
    device_id: int = Column(Integer, ForeignKey("iot_devices.id"))
    device = relationship("IotDevice", back_populates="configuration")
    enabled: bool = Column(Boolean, nullable=False, default=True)
    enabled_auto: bool = Column(Boolean, nullable=False, default=True)
    electricity_price: float = Column(Float, nullable=False)

    def to_json(self) -> dict:
        return {
            "enabled_manually": self.enabled,
            "enabled_auto": self.enabled_auto,
            "electricity_price": self.electricity_price,
        }


class DeviceSchedule(ModelsBase):
    __tablename__ = "device_schedule"

    id: int = Column(Integer, primary_key=True)
    device_id: int = Column(Integer, ForeignKey("iot_devices.id"))
    device = relationship("IotDevice")
    start_hour: int = Column(Integer, nullable=False)
    end_hour: int = Column(Integer, nullable=False)

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "start_hour": self.start_hour,
            "end_hour": self.end_hour,
        }


class DeviceReport(ModelsBase):
    __tablename__ = "device_reports"

    id: int = Column(Integer, primary_key=True)
    device_id: int = Column(Integer, ForeignKey("iot_devices.id"))
    device = relationship("IotDevice")
    time: datetime = Column(DateTime, nullable=False)
    enabled: bool = Column(Boolean, nullable=False)
    enabled_for: int = Column(Integer, nullable=True, default=None)

    def to_json(self) -> dict:
        return {
            "time": self.time,
            "enabled": self.enabled,
            "enabled_for": self.enabled_for,
        }


class FcmToken(ModelsBase):
    __tablename__ = "fcm_tokens"

    id: int = Column(Integer, primary_key=True)
    user_id: int = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")
    fcm_token: str = Column(String(), nullable=False)
    last_active_at: datetime = Column(DateTime, nullable=False)
