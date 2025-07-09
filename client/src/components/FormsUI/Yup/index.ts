import * as Yup from "yup";

// Email Regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Email validation
export const emailValidationSchema = Yup.string()
  .required("Email is required")
  .matches(EMAIL_REGEX, "Invalid email address")
  .max(255, "Must be less than 255 characters");

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
  email: emailValidationSchema,
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
  email: emailValidationSchema,
  password: Yup.string().required("Password is required"),
});

// ---------------------------
// Forgot Pass Initial Values
// ---------------------------
export const INITIAL_FORGOT_PASS_STATE = {
  email: "",
};

export const FORGOT_PASS_FORM_VALIDATION = Yup.object().shape({
  email: emailValidationSchema,
});

// ---------------------------
// Reset Password Initial Values
// ---------------------------
export const INITIAL_RESET_PASS_STATE = {
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

export const RESET_PASS_FORM_VALIDATION = Yup.object().shape({
  otp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d+$/, "OTP must contain only digits"),

  newPassword: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain Latin letters")
    .max(255, "Must be less than 255 characters"),

  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

// ---------------------------
// Ticket creation Initial Values
// ---------------------------
export const INITIAL_TICKET_FORM_STATE = {
  title: "",
  description: "",
  priority: "",
  category_id: "",
  attachments: [], // array of attachment id
};

export const TICKET_FORM_VALIDATION = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title must be under 100 characters"),

  description: Yup.string()
    .required("Description is required")
    .max(2000, "Description must be under 2000 characters"),

  priority: Yup.string()
    .required("Priority is required")
    .oneOf(["low", "medium", "high", "urgent"], "Invalid priority"),

  category_id: Yup.string()
    .required("Category is required")
    .matches(/^[a-f\d]{24}$/i, "Invalid category ID"),

  attachments: Yup.array().of(Yup.string()).nullable(),
});

// ---------------------------
// Profile Detail Initial Values
// ---------------------------
export const INITIAL_PROFILE_FORM_STATE = {
  name: "",
  companyName: "",
};

export const PROFILE_FORM_VALIDATION = Yup.object().shape({
  name: Yup.string().required("Full name is required").max(100),
  companyName: Yup.string().required("Company name is required").max(100),
});

// ---------------------------
// Update Password Initial Values
// ---------------------------
export const INITIAL_UPDATE_PASSWORD_FORM_STATE = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const UPDATE_PASSWORD_VALIDATION = Yup.object().shape({
  currentPassword: Yup.string()
    .required("Current password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain Latin letters")
    .max(255, "Must be less than 255 characters"),

  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain Latin letters")
    .max(255, "Must be less than 255 characters"),

  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

// PASSWORD CHANGE INITIAL STATE AND VALIDATION
// Initial form state
export const INITIAL_PASSWORD_CHANGE_STATE = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

// Yup validation schema
export const PASSWORD_CHANGE_FORM_VALIDATION = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),

  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "New password must contain Latin letters")
    .notOneOf(
      [Yup.ref("currentPassword"), null],
      "New password must be different from the current password"
    ),

  confirmNewPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

// Email Update
export const INITIAL_EMAIL_UPDATE_STATE = {
  newEmail: "",
  currentPassword: "",
};

export const EMAIL_UPDATE_VALIDATION = Yup.object().shape({
  newEmail: emailValidationSchema,
  currentPassword: Yup.string().required("Password is required"),
});
