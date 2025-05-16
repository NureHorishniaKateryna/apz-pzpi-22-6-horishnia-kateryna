import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {User} from "../types.ts";
import type {AppDispatch, RootState} from "../store.ts";

type AuthSliceState = {
    token: string | null;
    user: User | null;
}

type LoginParams = {
    email: string;
    password: string;
}

export type AuthSuccess = {
    token: string;
}

export type AuthError = {
    error: string;
}

export type AuthRet = {
    status: number;
    json: AuthSuccess | AuthError | null;
}

type RegisterParams = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

type FetchUserRet = {
    success: boolean;
    user: User | null;
    error: string | null;
}

export const login = createAsyncThunk(
    "auth/login",
    async (params: LoginParams): Promise<AuthRet> => {
        const resp = await fetch("http://127.0.0.1:9090/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(params)
        });
        const json = resp.status < 500 ? await resp.json() : null;

        return {
            status: resp.status,
            json: json,
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (params: RegisterParams): Promise<AuthRet> => {
        const resp = await fetch("http://127.0.0.1:9090/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(params)
        });
        const json = resp.status < 500 ? await resp.json() : null;

        return {
            status: resp.status,
            json: json,
        }
    }
);

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_: never, {getState}): Promise<FetchUserRet> => {
        const token = (getState() as RootState).auth.token;
        if(token === null) return {success: false, user: null, error: "Unauthorized"};

        const resp = await fetch("http://127.0.0.1:9090/api/user", {
            headers: {"Token": token},
        });
        if(resp.status >= 500)
            return {success: false, user: null, error: "Server error"};

        const json = await resp.json();
        if(resp.status >= 400)
            return {success: false, user: null, error: json.error};

        return {
            success: true,
            user: json,
            error: null,
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: null,
        user: null,
    } as AuthSliceState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            if(action.payload.status === 200 && "token" in (action.payload.json || {})) {
                state.token = (action.payload.json! as AuthSuccess).token;
            }
        });
        builder.addCase(register.fulfilled, (state, action) => {
            if(action.payload.status === 200 && "token" in (action.payload.json || {})) {
                state.token = (action.payload.json! as AuthSuccess).token;
            }
        });
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            if(action.payload.success === 200 && action.payload.user !== null) {
                state.user = action.payload.user!;
            }
        });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;