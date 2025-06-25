import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { type AxiosError } from "axios";

// Async action to authenticate user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post("/api/v1/users/login", credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log(data);

      return {
        token: data.accessToken,
        user: data.user,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;

      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed.";

      return rejectWithValue(message);
    }
  }
);

// Fetch Current User using refresh token cookie
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/users/refresh-token", null, {
        withCredentials: true,
      });

      return {
        token: data.accessToken,
        user: data.user,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;

      if (axiosError.response?.status === 401) {
        return rejectWithValue(null);
      }

      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Could not refresh session";

      return rejectWithValue(message);
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get("/api/v1/users/logout", {
        withCredentials: true,
      });

      // Return a success indicator — let component handle redirect
      return true;
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Logout failed";
      return rejectWithValue(message);
    }
  }
);
