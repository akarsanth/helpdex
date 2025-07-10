import { AxiosError } from "axios";
import axiosInstance from "../utils/axios";
import type { Category } from "../types/category";

// Form values for Create/Edit
export interface CategoryFormValues {
  name: string;
  description?: string;
}

// API Response shape
interface CategoryResponse {
  message: string;
  category: Category;
}

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get<{
      success: boolean;
      categories: Category[];
    }>("/api/v1/categories");

    return res.data.categories;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch categories."
    );
  }
};

// Create category
export const createCategory = async (
  payload: CategoryFormValues
): Promise<Category> => {
  try {
    const res = await axiosInstance.post<CategoryResponse>(
      "/api/v1/categories",
      payload
    );
    return res.data.category;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Category creation failed."
    );
  }
};

// Update category
export const updateCategory = async (
  id: string,
  payload: CategoryFormValues
): Promise<Category> => {
  try {
    const res = await axiosInstance.put<CategoryResponse>(
      `/api/v1/categories/${id}`,
      payload
    );
    return res.data.category;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Category update failed."
    );
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<string> => {
  try {
    const res = await axiosInstance.delete<{ message: string }>(
      `/api/v1/categories/${id}`
    );
    return res.data.message;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Category deletion failed."
    );
  }
};
