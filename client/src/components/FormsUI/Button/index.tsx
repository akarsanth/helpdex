import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { useFormikContext } from "formik";

const ButtonWrapper = ({ children, ...otherProps }: ButtonProps) => {
  const { submitForm, isSubmitting } = useFormikContext();

  // submit handler
  // submitHandler calls the submitForm() function
  // attached to Formik
  const submitHandler = () => {
    submitForm();
  };

  const configButton: ButtonProps = {
    onClick: submitHandler,
    ...otherProps,
    variant: "contained",
    type: "submit",
    loading: isSubmitting,
  };

  return <Button {...configButton}>{children}</Button>;
};

export default ButtonWrapper;
