import React, { useReducer, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";

// Service
import { registerUser } from "../services/register-service";

// Formik and Yup
import { Formik, Form as FormikForm } from "formik";
import type { FormikHelpers } from "formik";
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

  const submitHandler = async (
    values: typeof INITIAL_REGISTER_FORM_STATE,
    { resetForm }: FormikHelpers<typeof INITIAL_REGISTER_FORM_STATE>
  ) => {
    dispatch({ type: "REQUEST" });

    const { data, error } = await registerUser(values);

    if (error) {
      dispatch({ type: "FAIL", payload: error });
    } else {
      dispatch({ type: "SUCCESS", payload: data.message });
      resetForm();
    }
  };

  return (
    <FormContainer>
      <Typography sx={{ mb: 4 }} variant="h6">
        Register a account!
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
          </FormFields>
        </FormikForm>
      </Formik>
    </FormContainer>
  );
};

export default Register;
