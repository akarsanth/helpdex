// components/ResendVerificationButtonInline.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";

interface Props {
  email: string;
}

const ResendVerificationButtonInline: React.FC<Props> = ({ email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setCanResend(false);
    setResendTimer(60);

    try {
      const { data } = await axios.post("/api/v1/users/resend-verification", {
        email,
      });
      setSuccess(data.message || "Verification email resent successfully.");
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to resend verification email.";
      setError(msg);
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mt={2} display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2">Didn’t receive the email?</Typography>

        <Button
          variant="text"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          sx={{ textTransform: "none", minWidth: 180, p: 0 }}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            "Resend Verification Email"
          )}
        </Button>

        {!canResend && (
          <Typography variant="body2" color="text.secondary">
            ({resendTimer}s)
          </Typography>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mt: 1, width: "100%" }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1, width: "100%" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ResendVerificationButtonInline;
