import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Interfaces for local typing
interface Category {
  _id: string;
  name: string;
}

interface Status {
  _id: string;
  name: string;
  description?: string;
}

interface MetaState {
  categories: Category[];
  statuses: Status[];
  loading: boolean;
  error: string | null;
}

const initialState: MetaState = {
  categories: [],
  statuses: [],
  loading: false,
  error: null,
};

export const fetchMeta = createAsyncThunk(
  "meta/fetchMeta",
  async (_, thunkAPI) => {
    try {
      const [categoryRes, statusRes] = await Promise.all([
        axios.get("/api/v1/categories"),
        axios.get("/api/v1/statuses"),
      ]);

      return {
        categories: categoryRes.data,
        statuses: statusRes.data,
      };
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to fetch meta information";
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
        state.statuses = action.payload.statuses;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default metaSlice.reducer;
