import React, { useState } from "react";
import { useDispatch } from "react-redux";

// Redux
import { resetMessageState } from "../redux/store/message/message-slice";

// MUI
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import type { AlertColor, AlertProps } from "@mui/material/Alert";

// Custom Alert Component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Props Interface
interface MessageProps {
  message: string;
  type: AlertColor; // 'success' | 'info' | 'warning' | 'error'
}

// Component
const Message: React.FC<MessageProps> = ({ message, type }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;

    setOpen(false);
    dispatch(resetMessageState());
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={type} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Message;
