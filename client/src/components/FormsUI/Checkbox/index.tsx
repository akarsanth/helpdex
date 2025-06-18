import { Checkbox, FormControlLabel } from "@mui/material";
import type { CheckboxProps } from "@mui/material";
import { useField, useFormikContext } from "formik";
import type { ChangeEvent } from "react";

interface CheckboxWrapperProps extends CheckboxProps {
  name: string;
  label?: string;
}

const CheckboxWrapper = ({
  name,
  label,
  ...otherProps
}: CheckboxWrapperProps) => {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();

  // Handle checkbox change
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFieldValue(name, checked);
  };

  // Configure Checkbox props
  const configCheckbox: CheckboxProps = {
    ...field,
    ...otherProps,
    checked: field.value, // ensure controlled checkbox
    onChange: handleChange,
  };

  return (
    <FormControlLabel
      control={<Checkbox {...configCheckbox} />}
      label={label}
    />
  );
};

export default CheckboxWrapper;
