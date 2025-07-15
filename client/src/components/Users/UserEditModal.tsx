import React, { useState } from "react";
import { Alert, Typography } from "@mui/material";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import * as Yup from "yup";

import ModalWrapper from "../ModalWrapper";
import FormFields from "../FormsUI/FormFieldsWrapper";
import Button from "../FormsUI/Button";
import SelectWrapper from "../FormsUI/Select";
import Checkbox from "../FormsUI/Checkbox";

import type { User } from "../../types";
import { updateUser } from "../../services/user-service";

// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { setMessage } from "../../redux/store/message/message-slice";

interface Props {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES: User["role"][] = ["client", "qa", "developer", "admin"];

interface FormValues {
  role: User["role"];
  isApprovedByAdmin: boolean;
}

const USER_EDIT_VALIDATION = Yup.object({
  role: Yup.string().oneOf(ROLES).required("Role is required"),
  isApprovedByAdmin: Yup.boolean(),
});

const UserEditModal: React.FC<Props> = ({ open, user, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>
  ) => {
    setError(null);
    try {
      const updated = await updateUser(user._id, values);
      dispatch(
        setMessage({
          type: "success",
          message: `User '${updated.email}' updated successfully.`,
        })
      );
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update user.";
      setError(msg);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <ModalWrapper open={open} handleClose={onClose}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Edit User
      </Typography>

      <Formik<FormValues>
        initialValues={{
          role: user.role,
          isApprovedByAdmin: user.isApprovedByAdmin,
        }}
        validationSchema={USER_EDIT_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormFields>
              <SelectWrapper
                name="role"
                label="Role"
                required
                list={ROLES.map((r) => ({
                  id: r,
                  value: r,
                  text: r.charAt(0).toUpperCase() + r.slice(1),
                }))}
              />

              <Checkbox name="isApprovedByAdmin" label="Approved by Admin" />

              <Button color="secondary" disableElevation loading={isSubmitting}>
                Update User
              </Button>

              {error && <Alert severity="error">{error}</Alert>}
            </FormFields>
          </FormikForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default UserEditModal;
