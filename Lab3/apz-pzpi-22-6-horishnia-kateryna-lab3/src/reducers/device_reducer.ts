import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {Device} from "../types.ts";
import type {RootState} from "../store.ts";

type DevicesSliceState = {
    list: Device[];
    page: number;
    hasMore: boolean;
}

export type DeviceRetList = {
    count: number;
    result: Device[];
}

export type CreateDeviceParams = {
    name: string;
    electricity_price: number;
};

export type CreateDeviceRet = {
    error: string | null;
    result: Device | null;
}

export const fetchDevices = createAsyncThunk(
    "devices/fetchDevices",
    async (page: number, {getState}): Promise<DeviceRetList> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {count: 0, result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices?page=${page}&page_size=50`, {
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {count: 0, result: []};

        const json = await resp.json();
        if(resp.status >= 400)
            return {count: 0, result: []};

        return json;
    }
);

export const createDevice = createAsyncThunk(
    "devices/createDevice",
    async (params: CreateDeviceParams, {getState}): Promise<CreateDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices`, {
            method: "POST",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify(params),
        });
        if(resp.status >= 500)
            return {error: "Server error", result: null};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: null};

        return {error: null, result: json};
    }
);

const devicesSlice = createSlice({
    name: "devices",
    initialState: {
        list: [] as Device[],
        page: 1,
        hasMore: true,
    } as DevicesSliceState,
    reducers: {
        resetDevices: (state) => {
            state.list = [];
            state.page = 1;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDevices.fulfilled, (state, action) => {
            if ((state.list.length + action.payload.result.length) >= action.payload.count) {
                state.hasMore = false;
            }

            state.list.push(...action.payload.result);
            state.page += 1;
        });
        builder.addCase(createDevice.fulfilled, (state, action) => {
            if(action.payload.result === null) return;
            state.list = [action.payload.result, ...state.list];
        });
    },
});

export const { resetDevices } = devicesSlice.actions;
export default devicesSlice.reducer;