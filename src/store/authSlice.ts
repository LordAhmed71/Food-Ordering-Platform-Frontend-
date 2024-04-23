import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, axiosErrorHandler, isString } from "@/utils";

import { RootState } from "./store";
import {
  IAuthInitialState,
  ILoginUserRequest,
  ISignupUserRequest,
} from "@/types";
import { setUser } from "./userSlice";

const initialState: IAuthInitialState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  message: null,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async (data: ISignupUserRequest, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.post("/auth/signup", data);
      const { message } = res.data;
      return message;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: ILoginUserRequest, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      const res = await api.post("/auth/login", data);
      const user = res.data.data.user;
      const message = res.data.message;
      dispatch(setUser(user));
      return message;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  const { rejectWithValue, dispatch } = thunkAPI;
  try {
    const res = await api.get("/auth/logout");
    dispatch(setUser(null));
    const message = res.data.message;
    return message;
  } catch (error) {
    return rejectWithValue(axiosErrorHandler(error));
  }
});
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsAuthenticatedState: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.message = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        if (isString(action.payload)) {
          state.error = action.payload;
        }
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        if (isString(action.payload)) {
          state.error = action.payload;
        }
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.message = action.payload;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        if (isString(action.payload)) {
          state.error = action.payload;
        }
      });
  },
});

export default authSlice.reducer;
export const { updateIsAuthenticatedState } = authSlice.actions;

export const getAuthObj = (state: RootState) => state.auth;
