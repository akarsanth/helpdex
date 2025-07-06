import { useSelector, useDispatch } from "react-redux";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import { Box, Typography } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import FormFields from "../FormsUI/FormFieldsWrapper";
import Textfield from "../FormsUI/Textfield";
import Button from "../FormsUI/Button";

import { setMessage } from "../../redux/store/message/message-slice";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  INITIAL_PROFILE_FORM_STATE,
  PROFILE_FORM_VALIDATION,
} from "../FormsUI/Yup";

import { updateBasicProfile } from "../../services/user-service";
import { fetchCurrentUser } from "../../redux/store/auth/auth-actions";

interface BasicProfileFormValues {
  name: string;
  companyName: string;
}

const BasicProfileForm = () => {
  const appDispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (
    values: BasicProfileFormValues,
    helpers: FormikHelpers<BasicProfileFormValues>
  ) => {
    try {
      const res = await updateBasicProfile(values);
      appDispatch(setMessage({ type: "success", message: res.message }));
      appDispatch(fetchCurrentUser());
      helpers.resetForm({ values });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Profile update failed";
      appDispatch(setMessage({ type: "error", message: msg }));
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="body1" sx={{ mb: 2.5, fontWeight: 700 }}>
        Basic Information
      </Typography>

      <Formik<BasicProfileFormValues>
        initialValues={{
          ...INITIAL_PROFILE_FORM_STATE,
          name: user.name,
          companyName: user.companyName,
        }}
        validationSchema={PROFILE_FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormFields>
              <Textfield name="name" label="Full Name" required />
              <Textfield name="companyName" label="Company Name" required />

              <Button
                color="secondary"
                endIcon={<KeyboardArrowRightIcon />}
                disableElevation
                loading={isSubmitting} // show spinner while submitting
                sx={{ alignSelf: "flex-start" }}
              >
                Save Changes
              </Button>
            </FormFields>
          </FormikForm>
        )}
      </Formik>
    </Box>
  );
};

export default BasicProfileForm;
