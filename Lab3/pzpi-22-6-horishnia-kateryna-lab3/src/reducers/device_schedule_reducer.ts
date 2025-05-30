import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {ScheduleItem} from "../types.ts";
import type {RootState} from "../store.ts";

// TODO: handle time properly on backend
type ScheduleItemBackend = {
    id: number;
    start_hour: number;
    end_hour: number;
}

type ScheduleSliceState = {
    list: ScheduleItem[];
}

export type FetchDeviceScheduleRet = {
    error: string | null;
    result: ScheduleItem[];
}

export type CreateDeviceScheduleRet = {
    error: string | null;
    result: ScheduleItem | null;
}

export type CreateScheduleParams = {
    deviceId: number;
    start: number;
    end: number;
}

export type DeleteDeviceScheduleParams = {
    deviceId: number;
    scheduleId: number;
}

export type DeleteDeviceScheduleRet = {
    error: string | null;
    result: boolean;
}

export const fetchDeviceSchedule = createAsyncThunk(
    "device_schedule/fetchSchedule",
    async (deviceId: number, {getState}): Promise<FetchDeviceScheduleRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${deviceId}/schedule`, {
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error", result: []};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: []};

        return {
            error: null,
            result: (json as ScheduleItemBackend[]).map(item => ({
                id: item.id,
                start: item.start_hour * 3600,
                end: item.end_hour * 3600,
            }))
        };
    }
);

export const createSchedule = createAsyncThunk(
    "device_schedule/createSchedule",
    async (params: CreateScheduleParams, {getState}): Promise<CreateDeviceScheduleRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${params.deviceId}/schedule`, {
            method: "POST",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify({
                // TODO: handle minutes on backend
                "start_hour": Math.floor(params.start / 3600),
                "end_hour": Math.floor(params.end / 3600),
            }),
        });
        if(resp.status >= 500)
            return {error: "Server error", result: null};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: null};

        const item = json as ScheduleItemBackend;
        return {
            error: null,
            result: {
                id: item.id,
                start: item.start_hour * 3600,
                end: item.end_hour * 3600,
            }
        };
    }
);

export const deleteSchedule = createAsyncThunk(
    "device_schedule/deleteDeviceSchedule",
    async ({deviceId, scheduleId}: DeleteDeviceScheduleParams, {getState}): Promise<DeleteDeviceScheduleRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: false};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${deviceId}/schedule/${scheduleId}`, {
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

const scheduleSlice = createSlice({
    name: "schedule",
    initialState: {
        list: [] as ScheduleItem[],
    } as ScheduleSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchDeviceSchedule.fulfilled, (state, action) => {
            state.list = action.payload.result;
        });
        builder.addCase(createSchedule.fulfilled, (state, action) => {
            if(action.payload.result === null) return;
            state.list = [action.payload.result, ...state.list];
        });
    },
});

export default scheduleSlice.reducer;