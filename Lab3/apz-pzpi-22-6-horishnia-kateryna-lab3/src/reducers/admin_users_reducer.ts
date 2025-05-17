import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {User} from "../types.ts";
import type {RootState} from "../store.ts";

type AdminUsersSliceState = {
    list: User[];
    pages: number;
}

export type AdminUsersRet = {
    count: number;
    result: User[];
}

const pageSize = 10;

export const fetchUsers = createAsyncThunk(
    "admin_users/fetchUsers",
    async (page: number, {getState}): Promise<AdminUsersRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {count: 0, result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/users?page=${page}&page_size=${pageSize}`, {
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

const adminUsersSlice = createSlice({
    name: "admin_users",
    initialState: {
        list: [] as User[],
        pages: 0,
    } as AdminUsersSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.list = action.payload.result;
            state.pages = Math.ceil(action.payload.count / pageSize);
        });
    },
});

export default adminUsersSlice.reducer;