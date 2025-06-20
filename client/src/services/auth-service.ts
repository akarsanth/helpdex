import axios, { AxiosError } from "axios";

interface PasswordResetResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
}

export const requestPasswordReset = async (
  email: string
): Promise<{ data: PasswordResetResponse | null; error: string | null }> => {
  try {
    const { data } = await axios.post<PasswordResetResponse>(
      "/api/v1/users/forgot-password",
      { email }
    );
    return { data, error: null };
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    return {
      data: null,
      error: error.response?.data?.message ?? error.message ?? "Unknown error",
    };
  }
};

// Reset Password
interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const resetPasswordRequest = async (
  payload: ResetPasswordPayload
): Promise<{ data: ResetPasswordResponse | null; error: string | null }> => {
  try {
    const { data } = await axios.post<ResetPasswordResponse>(
      "/api/v1/users/reset-password",
      payload
    );
    return { data, error: null };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      data: null,
      error: error.response?.data?.message ?? error.message ?? "Unknown error",
    };
  }
};
