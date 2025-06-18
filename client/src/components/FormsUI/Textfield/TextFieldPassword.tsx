import { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import { useField } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type TextfieldPwWrapperProps = TextFieldProps & {
  name: string;
};

const TextfieldPwWrapper = ({
  name,
  ...otherProps
}: TextfieldPwWrapperProps) => {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prev) => !prev);

  // Base configuration
  const configTextfield: TextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
    size: "small",
    type: visible ? "text" : "password",
    InputProps: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={toggleVisibility}
            onMouseDown={(e) => e.preventDefault()}
            edge="end"
          >
            {visible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  };

  // Show error if needed
  if (meta && meta.touched && meta.error) {
    configTextfield.error = true;
    configTextfield.helperText = meta.error;
  }

  return <TextField {...configTextfield} />;
};

export default TextfieldPwWrapper;
