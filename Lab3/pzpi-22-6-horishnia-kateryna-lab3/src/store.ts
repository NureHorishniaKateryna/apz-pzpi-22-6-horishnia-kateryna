import {configureStore} from "@reduxjs/toolkit";
import devicesReducer from "./reducers/device_reducer.ts";
import authReducer from "./reducers/auth_reducer.ts";
import scheduleReducer from "./reducers/device_schedule_reducer.ts";
import reportsReducer from "./reducers/device_report_reducer.ts";
import adminUsersReducer from "./reducers/admin_users_reducer.ts";
import adminDevicesReducer from "./reducers/admin_devices_reducer.ts";
import adminBackupsReducer from "./reducers/admin_backups_reducer.ts";

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        auth: authReducer,
        schedule: scheduleReducer,
        reports: reportsReducer,
        admin_users: adminUsersReducer,
        admin_devices: adminDevicesReducer,
        admin_backups: adminBackupsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
