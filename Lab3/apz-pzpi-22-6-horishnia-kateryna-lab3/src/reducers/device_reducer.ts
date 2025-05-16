import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {Device} from "../types.ts";

type DevicesSliceState = {
    list: Device[];
    page: number;
    hasMore: boolean;
}

export const fetchDevices = createAsyncThunk(
    "devices/fetchDevices",
    async (page: number) => {
        // TODO: fetch via api
        const fakeDevices: Device[] = Array.from({ length: 25 }, (_, i) => ({
            id: page * 25 + i,
            name: `Device ${page * 25 + i}`,
            api_key: "test-key",
            configuration: {
                device_id:  page * 25 + i,
                enabled_manually: Math.random() > 0.5,
                enabled_auto: Math.random() > 0.5,
                electricity_price: Math.random() * 10,
            },
        }));

        return fakeDevices;
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
            if (action.payload.length === 0) {
                state.hasMore = false;
            } else {
                state.list.push(...action.payload);
                state.page += 1;
            }
        });
    },
});

export const { resetDevices } = devicesSlice.actions;
export default devicesSlice.reducer;