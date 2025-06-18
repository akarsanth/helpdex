import { useEffect } from "react";

// Router
import { useLocation, useNavigate } from "react-router-dom";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/store/auth/auth-actions";
import type { RootState, AppDispatch } from "../redux/store";

// Formik and yup
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import {
  INITIAL_LOGIN_FORM_STATE,
  LOGIN_FORM_VALIDATION,
} from "../components/FormsUI/Yup";

// Components
import FormContainer, { FormLink } from "../components/FormsUI/FormContainer";
import Textfield from "../components/FormsUI/Textfield";
import TextfieldPw from "../components/FormsUI/Textfield/TextFieldPassword";
import Button from "../components/FormsUI/Button";
import Message from "../components/Message";

// MUI imports
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FormFieldsWrapper from "../components/FormsUI/FormFieldsWrapper";

type LoginFormValues = typeof INITIAL_LOGIN_FORM_STATE;

// Main Component
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { error, message, isLoggedIn, user } = useSelector(
    (state: RootState) => state.auth
  );

  // After successful authentication and fetching of user info
  useEffect(() => {
    if (user) {
      // only for redirection
      if (location.state?.from) {
        navigate(location.state.from);
      } else {
        navigate("/");
      }
    }
  }, [user, navigate, location.state?.from]);

  // login submit handler
  const submitHandler = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      dispatch(loginUser(values));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false); // Make sure to set submitting to false after async operation
    }
  };

  return (
    <>
      {!isLoggedIn && (
        <FormContainer>
          <Typography
            variant="body1"
            component="h2"
            sx={{ mb: 4, fontWeight: 700 }}
          >
            Log In to Your Account!
          </Typography>

          <Formik
            initialValues={INITIAL_LOGIN_FORM_STATE}
            validationSchema={LOGIN_FORM_VALIDATION}
            onSubmit={submitHandler}
          >
            {({ status }) => (
              <FormikForm>
                <FormFieldsWrapper>
                  <Textfield label="Enter Email" name="email" required />
                  <TextfieldPw
                    label="Enter Password"
                    name="password"
                    required
                  />

                  <Button
                    color="secondary"
                    endIcon={<KeyboardArrowRightIcon />}
                    disableElevation
                  >
                    Login
                  </Button>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="body2">Create new account?</Typography>
                    <FormLink to="/register" underline="none">
                      <Typography variant="body2">Sign up!</Typography>
                    </FormLink>
                  </Box>

                  {status && <Alert severity="error">{status}</Alert>}
                  {message && <Message message={message} type="success" />}
                  {error && <Alert severity="error">{error}</Alert>}
                </FormFieldsWrapper>
              </FormikForm>
            )}
          </Formik>
        </FormContainer>
      )}
    </>
  );
};

export default Login;
