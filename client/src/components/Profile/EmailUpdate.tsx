import { useState } from "react";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import { Box, Typography, Alert } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

// Redux
import { type RootState, type AppDispatch } from "../../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../redux/store/auth/auth-actions";

// Components
import FormFields from "../FormsUI/FormFieldsWrapper";
import Textfield from "../FormsUI/Textfield";
import TextfieldPw from "../FormsUI/Textfield/TextFieldPassword";
import Button from "../FormsUI/Button";

// MUI
import { Button as MuiButton } from "@mui/material";

// Service
import { updateEmail, cancelPendingEmail } from "../../services/user-service";

// YUP
import {
  INITIAL_EMAIL_UPDATE_STATE,
  EMAIL_UPDATE_VALIDATION,
} from "../FormsUI/Yup";
import ResendVerificationButtonInline from "../ResendVerficationButton";
import { setMessage } from "../../redux/store/message/message-slice";

interface EmailUpdateFormValues {
  newEmail: string;
  currentPassword: string;
}

const EmailUpdateForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (
    values: EmailUpdateFormValues,
    helpers: FormikHelpers<EmailUpdateFormValues>
  ) => {
    setAlert(null);
    try {
      const res = await updateEmail(values);
      dispatch(fetchCurrentUser());
      dispatch(setMessage({ type: "success", message: res.message }));
      helpers.resetForm({
        values: INITIAL_EMAIL_UPDATE_STATE,
        touched: {},
        errors: {},
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Email update failed.";
      setAlert({ type: "error", message: msg });
    }
  };

  // Cancel
  const handleCancelPendingEmail = async () => {
    setAlert(null);
    try {
      const res = await cancelPendingEmail();

      dispatch(setMessage({ type: "info", message: res.message }));
      dispatch(fetchCurrentUser()); // Refresh user data
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to cancel pending email.";
      setAlert({ type: "error", message: msg });
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="body1" sx={{ mb: 2.5, fontWeight: 700 }}>
        Update Email
      </Typography>

      <Formik<EmailUpdateFormValues>
        initialValues={INITIAL_EMAIL_UPDATE_STATE}
        validationSchema={EMAIL_UPDATE_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormFields>
              <Textfield name="newEmail" label="New Email" required />
              <TextfieldPw
                name="currentPassword"
                label="Current Password"
                required
              />

              <Button
                color="secondary"
                endIcon={<KeyboardArrowRightIcon />}
                disableElevation
                loading={isSubmitting}
                sx={{ alignSelf: "flex-start" }}
              >
                Update Email
              </Button>

              {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
            </FormFields>
          </FormikForm>
        )}
      </Formik>

      {user?.pendingEmail && (
        <Box mt={2}>
          <Alert
            severity="warning"
            sx={{
              mb: 1,
              alignItems: "center", // ensures icon is vertically centered
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ gap: 1 }}
              alignItems="center"
              width="100%"
              flexWrap="wrap" // allows wrap on smaller screens
            >
              <Box>
                Please verify your new email:{" "}
                <strong>{user.pendingEmail}</strong>
              </Box>

              <MuiButton
                color="inherit"
                size="small"
                variant="outlined"
                onClick={handleCancelPendingEmail}
              >
                Cancel Email Change
              </MuiButton>
            </Box>
          </Alert>

          <ResendVerificationButtonInline email={user.pendingEmail} />
        </Box>
      )}
    </Box>
  );
};

export default EmailUpdateForm;
