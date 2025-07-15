import { Field, Formik, Form as FormikForm, type FieldProps } from "formik";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { setMessage } from "../redux/store/message/message-slice";

// Service
import { resetPasswordRequest } from "../services/auth-service";

// MUI
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";

// Components
import Button from "../components/FormsUI/Button";
import FormContainer, { FormLink } from "../components/FormsUI/FormContainer";
import FormFields from "../components/FormsUI/FormFieldsWrapper";
import TextfieldPw from "../components/FormsUI/Textfield/TextFieldPassword";
import OTPInput from "../components/OtpInput";

// Yup
import {
  INITIAL_RESET_PASS_STATE,
  RESET_PASS_FORM_VALIDATION,
} from "../components/FormsUI/Yup";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [resendTimer, setResendTimer] = useState(5); // countdown value
  const [canResend, setCanResend] = useState(false); // button state

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Declare a timer variable so we can clear it if needed
    let timer: NodeJS.Timeout;

    if (resendTimer > 0) {
      // Schedule a one-time decrement after 1 second
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else {
      // Timer finished, allow the user to resend OTP
      setCanResend(true);
    }

    // Cleanup: Cancel the timeout if component unmounts or resendTimer changes before timeout completes
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  // Resend otp handler
  const resendOtpHandler = async () => {
    console.log("here");
    try {
      setCanResend(false); // disable the button again
      setResendTimer(60); // restart countdown

      const response = await fetch("/api/v1/users/resend-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP.");
      } else {
        dispatch(setMessage({ type: "info", message: data.message }));
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Password update failed.";

      setError(msg || "Failed to resend OTP.");
    }
  };

  const submitHandler = async (values: {
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await resetPasswordRequest({
      email,
      otp: values.otp,
      newPassword: values.newPassword,
    });

    setLoading(false);

    if (error) {
      setError(error);
    } else if (data) {
      setSuccess(data.message);
      dispatch(setMessage({ type: "success", message: data.message }));
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError("Something went wrong.");
    }
  };

  return (
    <FormContainer>
      <Typography sx={{ mb: 4, textAlign: "center" }} variant="h6">
        Reset your password
      </Typography>

      <Typography sx={{ mb: 2, textAlign: "center" }} variant="body2">
        Enter the 6 digit OTP received in your email '{email}' in the box below.
      </Typography>

      <Formik
        initialValues={INITIAL_RESET_PASS_STATE}
        validationSchema={RESET_PASS_FORM_VALIDATION}
        onSubmit={submitHandler}
      >
        <FormikForm>
          <FormFields>
            {/* otp field */}
            <Box>
              <Field name="otp">
                {({ form }: FieldProps) => {
                  const error = form.touched.otp && Boolean(form.errors.otp);
                  const helperText = form.touched.otp
                    ? (form.errors.otp as string)
                    : "";

                  return (
                    <OTPInput
                      onChange={(val) => form.setFieldValue("otp", val)}
                      error={error}
                      helperText={helperText}
                    />
                  );
                }}
              </Field>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 2, mt: 1 }}
              >
                <Typography variant="body2">
                  Didn’t receive OTP?{" "}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 36,
                    }}
                  >
                    {canResend ? (
                      <MuiButton
                        variant="text"
                        onClick={resendOtpHandler}
                        size="small"
                        sx={{ p: 0, minWidth: "unset", height: 36 }}
                      >
                        Resend OTP
                      </MuiButton>
                    ) : (
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ fontWeight: 500 }}
                      >
                        Resend in {resendTimer}s
                      </Typography>
                    )}
                  </Box>
                </Typography>
              </Box>
            </Box>

            <TextfieldPw name="newPassword" label="New Password" required />
            <TextfieldPw
              name="confirmPassword"
              label="Confirm Password"
              required
            />

            <Button
              color="secondary"
              endIcon={<KeyboardArrowRightIcon />}
              disableElevation
              loading={loading}
            >
              Reset Password
            </Button>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Typography variant="body2">Or go back to</Typography>
              <FormLink to="/login" underline="none">
                <Typography variant="body2">Login!</Typography>
              </FormLink>
            </Box>

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </FormFields>
        </FormikForm>
      </Formik>
    </FormContainer>
  );
};

export default ResetPassword;
