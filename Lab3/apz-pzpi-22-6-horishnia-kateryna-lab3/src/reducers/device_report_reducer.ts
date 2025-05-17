import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {DeviceReport} from "../types.ts";
import type {RootState} from "../store.ts";

type DeviceReportsSliceState = {
    list: DeviceReport[];
    page: number;
    hasMore: boolean;
}

export type DeviceReportsRet = {
    count: number;
    result: DeviceReport[];
}

export type FetchDeviceReportsParams = {
    deviceId: number;
    page: number;
};

export const fetchReports = createAsyncThunk(
    "devices/fetchDevices",
    async ({deviceId, page}: FetchDeviceReportsParams, {getState}): Promise<DeviceReportsRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {count: 0, result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/devices/${deviceId}/reports?page=${page}&page_size=50`, {
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

const deviceReportsSlice = createSlice({
    name: "device_reports",
    initialState: {
        list: [] as DeviceReport[],
        page: 1,
        hasMore: true,
    } as DeviceReportsSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchReports.fulfilled, (state, action) => {
            if ((state.list.length + action.payload.result.length) >= action.payload.count) {
                state.hasMore = false;
            }

            state.list.push(...action.payload.result);
            state.page += 1;
        });
    },
});

export default deviceReportsSlice.reducer;