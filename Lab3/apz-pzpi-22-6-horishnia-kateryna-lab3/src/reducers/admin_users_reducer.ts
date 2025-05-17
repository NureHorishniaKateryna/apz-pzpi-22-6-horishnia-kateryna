import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {User} from "../types.ts";
import type {RootState} from "../store.ts";

type AdminUsersSliceState = {
    list: User[];
    pages: number;
    current: User | null;
}

export type AdminUsersRet = {
    count: number;
    result: User[];
}

export type AdminUserRet = {
    error: string | null;
    result: User | null;
}

export type AdminUserEditParams = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
}

export type AdminDeleteUserRet = {
    error: string | null;
    result: boolean;
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

export const fetchUser = createAsyncThunk(
    "admin_users/fetchUser",
    async (userId: number, {getState}): Promise<AdminUserRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/users/${userId}`, {
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

export const editUser = createAsyncThunk(
    "admin_users/editUser",
    async (params: AdminUserEditParams, {getState}): Promise<AdminUserRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: null};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/users/${params.userId}`, {
            method: "PATCH",
            headers: {"Token": token, "Content-Type": "application/json"},
            body: JSON.stringify({
                "first_name": params.firstName,
                "last_name": params.lastName,
                "email": params.email,
                "is_admin": params.isAdmin,
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

export const deleteUser = createAsyncThunk(
    "admin_users/deleteUser",
    async (userId: number, {getState}): Promise<AdminDeleteUserRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: false};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/users/${userId}`, {
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

const adminUsersSlice = createSlice({
    name: "admin_users",
    initialState: {
        list: [] as User[],
        pages: 0,
        current: null,
    } as AdminUsersSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.list = action.payload.result;
            state.pages = Math.ceil(action.payload.count / pageSize);
        });
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            if(action.payload.result !== null)
                state.current = action.payload.result;
        });
        builder.addCase(editUser.fulfilled, (state, action) => {
            if(action.payload.result !== null)
                state.current = action.payload.result;
        });
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            if(action.payload.result)
                state.current = null;
        });
    },
});

export default adminUsersSlice.reducer;