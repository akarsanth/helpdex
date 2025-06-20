import { Formik, Form as FormikForm } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { setMessage } from "../redux/store/message/message-slice";

// Service
import { requestPasswordReset } from "../services/auth-service";

// Yup
import {
  FORGOT_PASS_FORM_VALIDATION,
  INITIAL_FORGOT_PASS_STATE,
} from "../components/FormsUI/Yup";

// MUI
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Components
import Button from "../components/FormsUI/Button";
import FormContainer, { FormLink } from "../components/FormsUI/FormContainer";
import FormFields from "../components/FormsUI/FormFieldsWrapper";
import Textfield from "../components/FormsUI/Textfield";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitHandler = async (values: typeof INITIAL_FORGOT_PASS_STATE) => {
    setLoading(true);
    setError(null);

    const { data, error } = await requestPasswordReset(values.email);

    if (error) {
      setError(error);
      dispatch(setMessage({ type: "error", message: error }));
    } else if (data) {
      dispatch(setMessage({ type: "success", message: data.message }));
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } else {
      dispatch(setMessage({ type: "error", message: "Something went wrong!" }));
    }
  };

  return (
    <FormContainer>
      <Typography sx={{ mb: 4, textAlign: "center" }} variant="h6">
        Forgot your password?
      </Typography>

      <Formik
        initialValues={INITIAL_FORGOT_PASS_STATE}
        validationSchema={FORGOT_PASS_FORM_VALIDATION}
        onSubmit={submitHandler}
      >
        <FormikForm>
          <FormFields>
            <Textfield label="Email" name="email" type="email" required />

            <Button
              color="secondary"
              endIcon={<KeyboardArrowRightIcon />}
              disableElevation
              loading={isLoading}
            >
              Send OTP
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2">Remember your password?</Typography>
              <FormLink to="/login" underline="none">
                <Typography variant="body2">Login!</Typography>
              </FormLink>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2">Don't have an account?</Typography>
              <FormLink to="/register" underline="none">
                <Typography variant="body2">SignUp!</Typography>
              </FormLink>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
          </FormFields>
        </FormikForm>
      </Formik>
    </FormContainer>
  );
};

export default ForgotPassword;
