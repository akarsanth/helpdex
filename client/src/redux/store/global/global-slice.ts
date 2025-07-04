import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Interfaces for local typing
interface Category {
  _id: string;
  name: string;
}

interface MetaState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: MetaState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchMeta = createAsyncThunk(
  "meta/fetchMeta",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: { accessToken: string } };
      const token = state.auth.accessToken;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      // Only fetch categories now
      const categoryRes = await axios.get("/api/v1/categories", config);

      return {
        categories: categoryRes.data,
      };
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to fetch categories";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const metaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeta.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default metaSlice.reducer;
