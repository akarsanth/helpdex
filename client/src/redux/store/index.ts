import { configureStore } from "@reduxjs/toolkit";

// Import individual reducers
import authReducer from "./auth/auth-slice";
import messageReducer from "./message/message-slice";
import metaReducer from "./global/global-slice";

// Configure and create the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer, // Manages authentication state
    message: messageReducer, // Manages global messages (e.g., toasts)
    meta: metaReducer, //Adds meta state for categories & statuses
  },
});

// Infer types for state and dispatch
export type RootState = ReturnType<typeof store.getState>; // Entire Redux state shape
export type AppDispatch = typeof store.dispatch; // Type-safe dispatch for async actions

export default store;
