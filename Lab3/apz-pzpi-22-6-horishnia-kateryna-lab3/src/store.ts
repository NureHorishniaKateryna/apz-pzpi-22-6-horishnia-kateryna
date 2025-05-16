import {configureStore} from "@reduxjs/toolkit";
import devicesReducer from "./reducers/device_reducer.ts";
import authReducer from "./reducers/auth_reducer.ts";

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
