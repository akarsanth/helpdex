import axiosInstance from "../utils/axios";
import { AxiosError } from "axios";

// Update Password
interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export const updatePassword = async (values: PasswordUpdateInput) => {
  try {
    const response = await axiosInstance.put(
      "/api/v1/users/update-password",
      values
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Password update failed";
    throw new Error(msg);
  }
};

// Update Basic Profile
interface BasicProfileUpdateInput {
  name: string;
  companyName: string;
}

export const updateBasicProfile = async (values: BasicProfileUpdateInput) => {
  try {
    const response = await axiosInstance.put(
      "/api/v1/users/update-basic",
      values
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message || // Custom backend message
      axiosError.message || // Fallback Axios error
      "Profile update failed"; // Final fallback

    throw new Error(msg); // Re-throws a clean Error with message
  }
};

// Upload Avatar
export const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/v1/users/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Avatar upload failed";
    throw new Error(msg);
  }
};

// Email Update
interface EmailUpdateInput {
  newEmail: string;
  currentPassword: string;
}

export const updateEmail = async (values: EmailUpdateInput) => {
  try {
    const response = await axiosInstance.put(
      "/api/v1/users/update-email",
      values
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message || // Custom backend message
      axiosError.message || // Fallback Axios error
      "Email update failed"; // Final fallback

    throw new Error(msg); // Re-throws a clean Error with message
  }
};

// Cancel pending email
export const cancelPendingEmail = async () => {
  try {
    const response = await axiosInstance.put(
      "/api/v1/users/cancel-pending-email"
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Cancel failed";
    throw new Error(msg);
  }
};
