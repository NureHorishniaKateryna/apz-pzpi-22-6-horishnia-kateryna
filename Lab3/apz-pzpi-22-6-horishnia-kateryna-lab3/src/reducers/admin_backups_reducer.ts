import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {RootState} from "../store.ts";

type AdminBackupsSliceState = {
    list: string[];
}

export type AdminBackupsRet = {
    error: string | null;
    result: string[];
}

export type Admin204Ret = {
    error: string | null;
}

export const fetchBackups = createAsyncThunk(
    "admin_backups/fetchBackups",
    async (_: undefined, {getState}): Promise<AdminBackupsRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated", result: []};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/system/backups`, {
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error", result: []};

        const json = await resp.json();
        if(resp.status >= 400)
            return {error: json.error, result: []};

        return {error: null, result: json};
    }
);

export const createBackup = createAsyncThunk(
    "admin_backups/createBackup",
    async (_: undefined, {getState}): Promise<Admin204Ret> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated"};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/system/backups`, {
            method: "POST",
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error"};

        if(resp.status >= 400) {
            const json = await resp.json();
            return {error: json.error};
        }

        return {error: null};
    }
);

export const deleteBackup = createAsyncThunk(
    "admin_backups/deleteBackup",
    async (backupName: string, {getState}): Promise<Admin204Ret> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated"};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/system/backups/${backupName}`, {
            method: "DELETE",
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error"};

        if(resp.status >= 400) {
            const json = await resp.json();
            return {error: json.error};
        }

        return {error: null};
    }
);

export const restoreBackup = createAsyncThunk(
    "admin_backups/restoreBackup",
    async (backupName: string, {getState}): Promise<Admin204Ret> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {error: "Unauthenticated"};

        const resp = await fetch(`http://127.0.0.1:9090/api/admin/system/backups/${backupName}/restore`, {
            method: "POST",
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {error: "Server error"};

        if(resp.status >= 400) {
            const json = await resp.json();
            return {error: json.error};
        }

        return {error: null};
    }
);

const adminBackupsSlice = createSlice({
    name: "admin_backups",
    initialState: {
        list: [] as string[],
    } as AdminBackupsSliceState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchBackups.fulfilled, (state, action) => {
            if(action.payload.error === null)
                state.list = action.payload.result;
        });
    },
});

export default adminBackupsSlice.reducer;