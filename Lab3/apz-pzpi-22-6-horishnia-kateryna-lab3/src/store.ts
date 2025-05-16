import {configureStore} from "@reduxjs/toolkit";
import devicesReducer from "./reducers/device_reducer.ts";
import authReducer from "./reducers/auth_reducer.ts";
import scheduleReducer from "./reducers/device_schedule_reducer.ts";

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        auth: authReducer,
        schedule: scheduleReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
