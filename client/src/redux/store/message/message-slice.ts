import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define possible message types
export type MessageType = "success" | "error" | "info" | null;

// Define state interface for message
interface MessageState {
  type: MessageType; // 'success', 'error', 'info', or null
  message: string | null; // actual message text
}

// Initial state for message slice
const initialState: MessageState = {
  type: null, // 'success', 'error', 'info'
  message: null,
};

export const messageSlice = createSlice({
  name: "message",
  initialState,

  reducers: {
    // Set a new message with type
    setMessage: (
      state,
      action: PayloadAction<{
        type: Exclude<MessageType, null>;
        message: string;
      }>
    ) => {
      state.type = action.payload.type; // 'success', 'error', 'info'
      state.message = action.payload.message;
    },

    // Reset message to null
    resetMessageState: (state) => {
      state.type = null;
      state.message = null;
    },
  },
});

export const { setMessage, resetMessageState } = messageSlice.actions;

export default messageSlice.reducer;
