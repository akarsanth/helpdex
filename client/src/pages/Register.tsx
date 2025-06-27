import { useReducer, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

// Service
import { registerUser } from "../services/register-service";

// Formik and Yup
import type { FormikHelpers } from "formik";
import { Formik, Form as FormikForm } from "formik";
import {
  INITIAL_REGISTER_FORM_STATE,
  REGISTER_FORM_VALIDATION,
} from "../components/FormsUI/Yup";

// Components
import Button from "../components/FormsUI/Button";
import FormContainer, { FormLink } from "../components/FormsUI/FormContainer";
import FormFields from "../components/FormsUI/FormFieldsWrapper";
import Textfield from "../components/FormsUI/Textfield";
import TextfieldPw from "../components/FormsUI/Textfield/TextFieldPassword";
import ResendVerificationButton from "../components/ResendVerficationButton";

// MUI
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Types
interface RegisterState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

type RegisterAction =
  | { type: "REQUEST" }
  | { type: "SUCCESS"; payload: string }
  | { type: "FAIL"; payload: string };

const initialState: RegisterState = {
  isLoading: false,
  error: null,
  success: null,
};

const registerReducer = (
  state: RegisterState,
  action: RegisterAction
): RegisterState => {
  switch (action.type) {
    case "REQUEST":
      return { isLoading: true, error: null, success: null };
    case "SUCCESS":
      return { isLoading: false, error: null, success: action.payload };
    case "FAIL":
      return { isLoading: false, error: action.payload, success: null };
    default:
      return state;
  }
};

const Register = () => {
  const [state, dispatch] = useReducer(registerReducer, initialState);
  const { isLoading, error, success } = state;
  const formikRef = useRef(null);

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const submitHandler = async (
    values: typeof INITIAL_REGISTER_FORM_STATE,
    { resetForm }: FormikHelpers<typeof INITIAL_REGISTER_FORM_STATE>
  ) => {
    dispatch({ type: "REQUEST" });

    const {
      data,
      error,
      unverifiedEmail: backendUnverifiedEmail,
    } = await registerUser(values);

    if (error) {
      if (backendUnverifiedEmail) {
        setUnverifiedEmail(backendUnverifiedEmail); // case: user already exists but not verified
      } else {
        setUnverifiedEmail(null);
      }
      dispatch({ type: "FAIL", payload: error });
    } else {
      setUnverifiedEmail(values.email); // case: first-time successful registration
      dispatch({ type: "SUCCESS", payload: data.message });
      resetForm();
    }
  };

  return (
    <FormContainer>
      <Typography sx={{ mb: 4, textAlign: "center" }} variant="h6">
        Register an account!
      </Typography>

      <Formik
        initialValues={{ ...INITIAL_REGISTER_FORM_STATE }}
        validationSchema={REGISTER_FORM_VALIDATION}
        onSubmit={submitHandler}
        innerRef={formikRef}
      >
        <FormikForm>
          <FormFields>
            <Textfield label="Name" name="name" required />
            <Textfield label="Company Name" name="companyName" required />
            <Textfield label="Email" type="email" name="email" required />
            <TextfieldPw label="Password" name="password" required />
            <TextfieldPw
              label="Confirm Password"
              name="confirmPassword"
              required
            />

            <Button
              color="secondary"
              endIcon={<KeyboardArrowRightIcon />}
              disableElevation
              loading={isLoading}
            >
              Register
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2">Already have an account?</Typography>
              <FormLink to="/login" component={RouterLink} underline="none">
                <Typography variant="body2">Login!</Typography>
              </FormLink>
            </Box>

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            {unverifiedEmail && (
              <Box sx={{ mt: 2 }}>
                <ResendVerificationButton email={unverifiedEmail} />
              </Box>
            )}
          </FormFields>
        </FormikForm>
      </Formik>
    </FormContainer>
  );
};

export default Register;
