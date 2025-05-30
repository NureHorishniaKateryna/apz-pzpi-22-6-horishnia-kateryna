import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {Device} from "../types.ts";
import type {RootState} from "../store.ts";

type DevicesSliceState = {
    list: Device[];
    device: Device | null;
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

export type FetchDeviceRet = CreateDeviceRet;

export type EditDeviceParams = {
    id: number,
    name: string | null,
    electricity_price: number | null,
    enabled_auto: boolean | null,
    enabled_manually: boolean | null,
}

export type DeleteDeviceRet = {
    error: string | null;
    result: boolean;
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

export const fetchDevice = createAsyncThunk(
    "devices/fetchDevice",
    async (deviceId: number, {getState}): Promise<FetchDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${deviceId}`, {
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
    "devices/editDevice",
    async (params: EditDeviceParams, {getState}): Promise<FetchDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const config_resp = await fetch(`http://127.0.0.1:9090/api/devices/${params.id}/config`, {
            method: "PATCH",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify({
                "electricity_price": params.electricity_price,
                "enabled_auto": params.enabled_auto,
                "enabled_manually": params.enabled_manually,
            }),
        });
        if(config_resp.status >= 500)
            return {error: "Server error", result: null};

        const config_json = await config_resp.json();
        if(config_resp.status >= 400)
            return {error: config_json.error, result: null};

        const dev_resp = await fetch(`http://127.0.0.1:9090/api/devices/${params.id}`, {
            method: "PATCH",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify({"name": params.name}),
        });
        if(dev_resp.status >= 500)
            return {error: "Server error", result: null};

        const dev_json = await dev_resp.json();
        if(dev_resp.status >= 400)
            return {error: dev_json.error, result: null};

        return {error: null, result: dev_json};
    }
);

export const deleteDevice = createAsyncThunk(
    "devices/deleteDevice",
    async (deviceId: number, {getState}): Promise<DeleteDeviceRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: false};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${deviceId}`, {
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

const devicesSlice = createSlice({
    name: "devices",
    initialState: {
        list: [] as Device[],
        device: null,
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

        builder.addCase(fetchDevice.fulfilled, (state, action) => {
            if(action.payload.result === null) return;
            state.device = action.payload.result;
        });
        builder.addCase(editDevice.fulfilled, (state, action) => {
            if(action.payload.result === null) return;
            state.device = action.payload.result;
        });
        builder.addCase(deleteDevice.fulfilled, (state, action) => {
            if(!action.payload.result) return;
            state.device = null;
        });
    },
});

export const { resetDevices } = devicesSlice.actions;
export default devicesSlice.reducer;