import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {Device} from "../types.ts";
import type {RootState} from "../store.ts";

type AdminDevicesSliceState = {
    list: Device[];
    pages: number;
    current: Device | null;
}

export type AdminDevicesRet = {
    count: number;
    result: Device[];
}

export type AdminDeviceRet = {
    error: string | null;
    result: Device | null;
}

export type AdminDeviceEditParams = {
    deviceId: number;
    name: string;
}

export type AdminDeleteDeviceRet = {
    error: string | null;
    result: boolean;
}

const pageSize = 10;

export const fetchDevices = createAsyncThunk(
    "admin_devices/fetchDevices",
    async (page: number, {getState}): Promise<AdminDevicesRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {count: 0, result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/devices?page=${page}&page_size=${pageSize}`, {
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

export const fetchDevice = createAsyncThunk(
    "admin_devices/fetchDevice",
    async (deviceId: number, {getState}): Promise<AdminDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/devices/${deviceId}`, {
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error", result: null};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: null};

        return {error: null, result: json};
    }
);

export const editDevice = createAsyncThunk(
    "admin_devices/editDevice",
    async (params: AdminDeviceEditParams, {getState}): Promise<AdminDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/devices/${params.deviceId}`, {
            method: "PATCH",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify({
                "name": params.name,
            })
        });
        if(resp.status >= 500)
            return {error: "Server error", result: null};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: null};

        return {error: null, result: json};
    }
);

export const deleteDevice = createAsyncThunk(
    "admin_devices/deleteDevice",
    async (deviceId: number, {getState}): Promise<AdminDeleteDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: false};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/devices/${deviceId}`, {
            method: "DELETE",
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error", result: false};

        if(resp.status >= 400) {
            const json = await resp.json();
            return {error: json.error, result: false};
        }

        return {error: null, result: true};
    }
);

const adminDevicesSlice = createSlice({
    name: "admin_devices",
    initialState: {
        list: [] as Device[],
        pages: 0,
        current: null,
    } as AdminDevicesSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchDevices.fulfilled, (state, action) => {
            state.list = action.payload.result;
            state.pages = Math.ceil(action.payload.count / pageSize);
        });
        builder.addCase(fetchDevice.fulfilled, (state, action) => {
            if(action.payload.result !== null)
                state.current = action.payload.result;
        });
        builder.addCase(editDevice.fulfilled, (state, action) => {
            if(action.payload.result !== null)
                state.current = action.payload.result;
        });
        builder.addCase(deleteDevice.fulfilled, (state, action) => {
            if(action.payload.result)
                state.current = null;
        });
    },
});

export default adminDevicesSlice.reducer;