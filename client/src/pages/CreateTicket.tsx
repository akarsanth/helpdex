import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import {
  INITIAL_TICKET_FORM_STATE,
  TICKET_FORM_VALIDATION,
} from "../components/FormsUI/Yup";

// Form UI components
import Textfield from "../components/FormsUI/Textfield";
import Select from "../components/FormsUI/Select";
import Button from "../components/FormsUI/Button";
import FormFields from "../components/FormsUI/FormFieldsWrapper";
import FileUpload from "../components/FormsUI/FileUpload";

// MUI components
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setMessage } from "../redux/store/message/message-slice";
import type { AppDispatch, RootState } from "../redux/store";
import { createTicket } from "../services/ticket-service";

// ---------- Types ----------
interface TicketFormValues {
  title: string;
  description: string;
  priority: string;
  category_id: string;
  attachments: string[];
}

interface TicketState {
  isLoading: boolean;
  success: string | null;
  error: string | null;
}

// ---------- Reducer for local ticket submission state ----------
const initialState: TicketState = {
  isLoading: false,
  success: null,
  error: null,
};

type TicketAction =
  | { type: "REQUEST" }
  | { type: "SUCCESS"; payload: string }
  | { type: "FAIL"; payload: string };

function reducer(state: TicketState, action: TicketAction): TicketState {
  switch (action.type) {
    case "REQUEST":
      return { ...state, isLoading: true, success: null, error: null };
    case "SUCCESS":
      return { isLoading: false, success: action.payload, error: null };
    case "FAIL":
      return { isLoading: false, success: null, error: action.payload };
    default:
      return state;
  }
}

// ---------- Priority dropdown options ----------
const PRIORITY_OPTIONS = [
  { id: "low", value: "low", text: "Low" },
  { id: "medium", value: "medium", text: "Medium" },
  { id: "high", value: "high", text: "High" },
  { id: "urgent", value: "urgent", text: "Urgent" },
];

// ---------- Main component ----------
const CreateTicket = () => {
  const navigate = useNavigate();
  const appDispatch = useDispatch<AppDispatch>();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Track upload state to prevent submission while files are uploading
  const [uploading, setUploading] = useState(false);

  // uploaded attachments
  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState<string[]>(
    []
  );

  // Get available categories from Redux global state
  const categories = useSelector((state: RootState) => state.meta.categories);

  // ---------- Handle form submission ----------
  const handleSubmit = async (
    values: TicketFormValues,
    helpers: FormikHelpers<TicketFormValues>
  ) => {
    // Prevent form submission if a file is still being uploaded
    if (uploading) {
      const message = "Please wait for file upload to complete.";
      appDispatch(setMessage({ type: "error", message }));
      dispatch({ type: "FAIL", payload: message });
      return;
    }

    dispatch({ type: "REQUEST" });

    try {
      console.log(values);
      const { message, ticket } = await createTicket({
        ...values,
        attachments: uploadedAttachmentIds,
      });

      dispatch({ type: "SUCCESS", payload: message });
      appDispatch(setMessage({ type: "success", message }));
      navigate(`/dashboard/my-tickets/${ticket._id}`);
      helpers.resetForm();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Submission failed";
      dispatch({ type: "FAIL", payload: msg });
      appDispatch(setMessage({ type: "error", message: msg }));
    }
  };

  return (
    <Box sx={{ maxWidth: 786, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 4, textAlign: "center" }}>
        Create Support Ticket
      </Typography>

      <Formik<TicketFormValues>
        initialValues={INITIAL_TICKET_FORM_STATE}
        validationSchema={TICKET_FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        <FormikForm>
          <FormFields>
            {/* Ticket title field */}
            <Textfield name="title" label="Title" required />

            {/* Ticket description field */}
            <Textfield
              name="description"
              label="Description"
              multiline
              rows={4}
              required
            />

            {/* Priority dropdown */}
            <Select
              name="priority"
              label="Priority"
              list={PRIORITY_OPTIONS}
              required
            />

            {/* Category dropdown populated from Redux */}
            <Select
              name="category_id"
              label="Category"
              list={categories.map((cat) => ({
                id: cat._id,
                value: cat._id,
                text: cat.name,
              }))}
              required
            />

            {/* File upload component with progress and error handling */}
            <FileUpload
              setUploading={setUploading}
              uploading={uploading}
              onUploadSuccess={(id) =>
                setUploadedAttachmentIds((prev) => [...prev, id])
              }
              onUploadError={(msg) => {
                dispatch({ type: "FAIL", payload: msg });
                appDispatch(setMessage({ type: "error", message: msg }));
              }}
            />

            {/* Submit button disabled while uploading */}
            <Button
              color="secondary"
              endIcon={<KeyboardArrowRightIcon />}
              disableElevation
              loading={state.isLoading}
              disabled={uploading}
            >
              Create Ticket
            </Button>

            {/* Success message */}
            {state.success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {state.success}
              </Alert>
            )}

            {/* Error message */}
            {state.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {state.error}
              </Alert>
            )}
          </FormFields>
        </FormikForm>
      </Formik>
    </Box>
  );
};

export default CreateTicket;
