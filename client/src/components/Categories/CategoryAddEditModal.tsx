import { Alert, Typography } from "@mui/material";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import {
  createCategory,
  updateCategory,
} from "../../services/category-service";

// Components
import Button from "../FormsUI/Button";
import FormFields from "../FormsUI/FormFieldsWrapper";
import Textfield from "../FormsUI/Textfield";

// Types
import type { Category } from "../../types/category";
import ModalWrapper from "../ModalWrapper";

// redux
import type { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { setMessage } from "../../redux/store/message/message-slice";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues: Category | null;
  actionType: "Add" | "Edit";
}

interface CategoryFormValues {
  name: string;
  description: string;
}

const INITIAL_STATE: CategoryFormValues = {
  name: "",
  description: "",
};

const CATEGORY_VALIDATION = Yup.object({
  name: Yup.string().required("Category name is required"),
  description: Yup.string().max(200, "Max 200 characters"),
});

const CategoryAddEditModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  initialValues,
  actionType,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = actionType === "Edit";
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (
    values: CategoryFormValues,
    helpers: FormikHelpers<CategoryFormValues>
  ) => {
    setAlert(null);

    try {
      if (isEdit && initialValues?._id) {
        const category = await updateCategory(initialValues._id, values);
        dispatch(
          setMessage({
            type: "success",
            message: `Category #${category._id} updated successfully.`,
          })
        );
      } else {
        const category = await createCategory(values);
        dispatch(
          setMessage({
            type: "success",
            message: `Category #${category._id} created successfully.`,
          })
        );
      }

      helpers.resetForm({ values: INITIAL_STATE });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setAlert({ type: "error", message: msg });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <ModalWrapper open={open} handleClose={onClose}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {isEdit ? "Edit Category" : "Add Category"}
      </Typography>

      <Formik<CategoryFormValues>
        initialValues={{
          name: initialValues?.name || "",
          description: initialValues?.description || "",
        }}
        validationSchema={CATEGORY_VALIDATION}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <FormFields>
              <Textfield name="name" label="Category Name" required />
              <Textfield name="description" label="Description" multiline />

              <Button
                color="secondary"
                disableElevation
                loading={isSubmitting}
                // sx={{ alignSelf: "flex-start" }}
              >
                {isEdit ? "Update Category" : "Create Category"}
              </Button>

              {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
            </FormFields>
          </FormikForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default CategoryAddEditModal;
