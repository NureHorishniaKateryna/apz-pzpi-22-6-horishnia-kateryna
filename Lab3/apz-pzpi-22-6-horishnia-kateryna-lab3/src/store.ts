import {configureStore} from "@reduxjs/toolkit";
import devicesReducer from "./reducers/device_reducer.ts";
import authReducer from "./reducers/auth_reducer.ts";
import scheduleReducer from "./reducers/device_schedule_reducer.ts";
import reportsReducer from "./reducers/device_report_reducer.ts";

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        auth: authReducer,
        schedule: scheduleReducer,
        reports: reportsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
