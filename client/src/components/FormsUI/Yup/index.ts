import * as Yup from "yup";

// ---------------------------
// Register Initial Values
// ---------------------------
export const INITIAL_REGISTER_FORM_STATE = {
  name: "",
  companyName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Register Validation Schema
export const REGISTER_FORM_VALIDATION = Yup.object().shape({
  name: Yup.string()
    .required("Full name is required")
    .max(100, "Must be less than 100 characters"),
  companyName: Yup.string()
    .required("Company name is required")
    .max(100, "Must be less than 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address")
    .max(255, "Must be less than 255 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain Latin letters")
    .max(255, "Must be less than 255 characters"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

// ---------------------------
// Login Initial Values
// ---------------------------
export const INITIAL_LOGIN_FORM_STATE = {
  email: "",
  password: "",
};

// Login Validation Schema
export const LOGIN_FORM_VALIDATION = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  password: Yup.string().required("Password is required"),
});
