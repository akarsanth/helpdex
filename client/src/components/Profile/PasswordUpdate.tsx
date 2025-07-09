import { useState } from "react";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import { Box, Typography, Alert } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import FormFields from "../FormsUI/FormFieldsWrapper";
import TextfieldPw from "../FormsUI/Textfield/TextFieldPassword";
import Button from "../FormsUI/Button";

import {
  INITIAL_PASSWORD_CHANGE_STATE,
  PASSWORD_CHANGE_FORM_VALIDATION,
} from "../FormsUI/Yup";

import { updatePassword } from "../../services/user-service";

interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const PasswordUpdateForm = () => {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (
    values: PasswordChangeFormValues,
    helpers: FormikHelpers<PasswordChangeFormValues>
  ) => {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setAlert({ type: "success", message: "Password updated successfully." });
      helpers.resetForm();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Password update failed.";
      setAlert({ type: "error", message: msg });
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="body1" sx={{ mb: 2.5, fontWeight: 700 }}>
        Update Password
      </Typography>

      <Formik<PasswordChangeFormValues>
        initialValues={INITIAL_PASSWORD_CHANGE_STATE}
        validationSchema={PASSWORD_CHANGE_FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormFields>
              <TextfieldPw
                name="currentPassword"
                label="Current Password"
                required
              />
              <TextfieldPw name="newPassword" label="New Password" required />
              <TextfieldPw
                name="confirmNewPassword"
                label="Confirm New Password"
                required
              />

              <Button
                color="secondary"
                endIcon={<KeyboardArrowRightIcon />}
                disableElevation
                loading={isSubmitting}
                sx={{ alignSelf: "flex-start" }}
              >
                Update Password
              </Button>

              {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
            </FormFields>
          </FormikForm>
        )}
      </Formik>
    </Box>
  );
};

export default PasswordUpdateForm;
