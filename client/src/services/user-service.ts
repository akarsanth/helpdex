import type { User } from "../types";
import axiosInstance from "../utils/axios";
import { AxiosError } from "axios";
import type { MRT_ColumnFiltersState } from "material-react-table";

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

// Get All Users
interface FetchUsersOptions {
  pageIndex: number;
  pageSize: number;
  filters: MRT_ColumnFiltersState;
}

interface FetchUsersResponse {
  users: User[];
  total: number;
}

export const fetchUsers = async (
  options?: FetchUsersOptions
): Promise<FetchUsersResponse> => {
  try {
    const response = await axiosInstance.get<FetchUsersResponse>(
      "/api/v1/users",
      {
        params: {
          page: (options?.pageIndex ?? 0) + 1,
          pageSize: options?.pageSize ?? 10,
          filters: JSON.stringify(options?.filters ?? []),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Failed to fetch users.";
    throw new Error(msg);
  }
};

// Update user
export const updateUser = async (
  userId: string,
  payload: Partial<Pick<User, "role" | "isApprovedByAdmin">>
): Promise<User> => {
  try {
    const res = await axiosInstance.put(`/api/v1/users/${userId}`, payload);
    return res.data.user;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "User update failed.";
    throw new Error(msg);
  }
};
