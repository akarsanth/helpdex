import type { ReactNode } from "react";
// MUI Imports
import { Box } from "@mui/material";
// Styled Components
import { styled } from "@mui/material/styles";

// Styled Form Component
const Form = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

// Props Type
interface FormWrapperProps {
  children: ReactNode;
}

const FormFieldsWrapper = ({ children }: FormWrapperProps) => {
  return <Form>{children}</Form>;
};

export default FormFieldsWrapper;
