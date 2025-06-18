import React from "react";
import { useField, useFormikContext } from "formik";

// MUI Components
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

interface Option {
  id: string | number;
  value: string | number;
  text: string;
}

type SelectWrapperProps = TextFieldProps & {
  name: string;
  list: Option[];
};

const SelectWrapper = ({ name, list, ...otherProps }: SelectWrapperProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  // handle change and update formik field
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFieldValue(name, value);
    console.log(value);
  };

  const configSelect: TextFieldProps = {
    ...field,
    ...otherProps,
    select: true,
    fullWidth: true,
    variant: "outlined",
    onChange: handleChange,
  };

  if (meta && meta.touched && meta.error) {
    configSelect.error = true;
    configSelect.helperText = meta.error;
  }

  return (
    <TextField {...configSelect}>
      {list.map((option) => (
        <MenuItem key={option.id} value={option.value}>
          {option.text}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectWrapper;
