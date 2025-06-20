import { Box, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  error?: boolean;
  helperText?: string;
}

const OTPInput = ({
  length = 6,
  onChange,
  error = false,
  helperText = "",
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      onChange(updatedOtp.join(""));

      if (value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Inner container to align inputs and error text together */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" gap={1} justifyContent="center">
          {otp.map((digit, i) => (
            <TextField
              key={i}
              inputRef={(el) => (inputsRef.current[i] = el!)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              inputProps={{
                maxLength: 1,
                style: { textAlign: "center", fontSize: "1.25rem" },
              }}
              error={error}
              sx={{ width: 40 }}
              variant="outlined"
            />
          ))}
        </Box>

        {helperText && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 0.6, ml: 1.5, alignSelf: "flex-start" }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default OTPInput;
