import { createSlice } from "@reduxjs/toolkit";
import { loginUser, fetchCurrentUser, logoutUser } from "./auth-actions";

export type UserRole = "client" | "qa" | "admin" | "developer";

interface User {
  id: string;
  name: string;
  companyName: string;
  email: string;
  pendingEmail?: string;
  role: UserRole;
  avatar?: {
    url: string;
    public_id: string;
  };
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  isApprovedByAdmin: boolean;
  adminApprovedAt?: string;
}

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean | undefined;
  user: User | null;
  accessToken: string | null;
  error: string | null;
  message: string | null;
  unverifiedEmail?: string | null;
}

const initialState: AuthState = {
  isLoading: false,
  isLoggedIn: undefined,
  user: null,
  accessToken: null,
  error: null,
  message: null,
  unverifiedEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: () => initialState,
    clearStatus: (state) => {
      state.error = null;
      state.message = null;
      state.unverifiedEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.message = "Login successful";
        state.unverifiedEmail = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload && typeof action.payload === "object") {
          const payload = action.payload as {
            message: string;
            unverifiedEmail?: string;
          };
          state.error = payload.message;
          state.unverifiedEmail = payload.unverifiedEmail ?? null;
        } else {
          state.error = "Login failed";
          state.unverifiedEmail = null;
        }

        state.message = null;
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.token;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.message = "Session restored";
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
        state.message = null;
      })

      .addCase(logoutUser.fulfilled, () => {
        return initialState;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export const { resetAuthState, clearStatus } = authSlice.actions;
export default authSlice.reducer;
