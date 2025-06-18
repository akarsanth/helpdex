import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import { useField } from "formik";

type TextfieldWrapperProps = TextFieldProps & {
  name: string;
};

const TextfieldWrapper = ({ name, ...otherProps }: TextfieldWrapperProps) => {
  //
  const [field, meta] = useField(name);

  // configuration for the TextField component
  const configTextfield: TextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: otherProps.variant || "outlined",
    size: "small",
  };

  // checking if there is error
  // if error change error to true
  // and add error helperText
  if (meta && meta.touched && meta.error) {
    configTextfield.error = true;
    configTextfield.helperText = meta.error;
  }

  return <TextField {...configTextfield} />;
};

export default TextfieldWrapper;
