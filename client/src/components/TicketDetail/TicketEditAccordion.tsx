import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Typography,
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Formik, Form as FormikForm } from "formik";
import { useState } from "react";
import * as Yup from "yup";

// Custom components
import Button from "../FormsUI/Button";
import FormFields from "../FormsUI/FormFieldsWrapper";
import Select from "../FormsUI/Select";
import Textfield from "../FormsUI/Textfield";

// Redux
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { setMessage } from "../../redux/store/message/message-slice";

// Types
import type { Ticket } from "../../types";
import { updateTicketDetails } from "../../services/ticket-service";

interface Props {
  ticket: Ticket;
  onUpdate: () => void;
}

// Priority options used in the select dropdown
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"].map((val) => ({
  id: val,
  value: val,
  text: val[0].toUpperCase() + val.slice(1),
}));

// Main component
const TicketEditAccordion = ({ ticket, onUpdate }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const role = useSelector((state: RootState) => state.auth.user?.role);
  const categories = useSelector((state: RootState) => state.meta.categories);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define editable fields based on user role
  type Role = "client" | "qa" | "developer";
  const editableFields: Record<Role, string[]> = {
    client: ["title", "description", "priority"],
    qa: ["priority", "category_id", "deadline"],
    developer: ["description"],
  };
  const canEdit = editableFields[role as Role] ?? [];

  // Prevent editing based on ticket status
  const isEditableStatus = !["Resolved", "Closed"].includes(ticket.status);
  const showForm = isEditableStatus && canEdit.length > 0;

  const INITIAL_VALUES = {
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    category_id: ticket.category?._id || "",
    deadline: ticket.deadline?.split("T")[0] || "",
  };

  const VALIDATION_SCHEMA = Yup.object({
    title: Yup.string()
      .trim()
      .max(100)
      .when([], {
        is: () => canEdit.includes("title"),
        then: (schema) => schema.required("Required"),
      }),
    description: Yup.string()
      .trim()
      .max(1000)
      .when([], {
        is: () => canEdit.includes("description"),
        then: (schema) => schema.required("Required"),
      }),
    priority: Yup.string().when([], {
      is: () => canEdit.includes("priority"),
      then: (schema) => schema.required("Required"),
    }),
    category_id: Yup.string().when([], {
      is: () => canEdit.includes("category_id"),
      then: (schema) => schema.required("Required"),
    }),
    deadline: Yup.string().when([], {
      is: () => canEdit.includes("deadline"),
      then: (schema) => schema.required("Required"),
    }),
  });

  const handleSubmit = async (values: typeof INITIAL_VALUES) => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Call the update service with ticket ID and form values
      await updateTicketDetails(ticket._id, values);

      dispatch(setMessage({ type: "success", message: "Ticket updated" }));
      setSuccess("Ticket updated successfully");

      onUpdate(); //  updated ticket
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update ticket";
      setError(msg);
      dispatch(setMessage({ type: "error", message: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "grey.200",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="edit-content"
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      >
        <Typography fontWeight="bold">Edit Ticket</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ borderTop: 1, borderColor: "grey.100", py: 3 }}>
        {!showForm ? (
          <Typography color="text.secondary">
            {!isEditableStatus
              ? `This ticket is marked as ${ticket.status} and cannot be edited.`
              : `No editable fields available for your role.`}
          </Typography>
        ) : (
          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            <FormikForm>
              <FormFields>
                {canEdit.includes("title") && (
                  <Textfield name="title" label="Title" required />
                )}

                {canEdit.includes("description") && (
                  <Textfield
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    required
                  />
                )}

                {canEdit.includes("priority") && (
                  <Select
                    name="priority"
                    label="Priority"
                    list={PRIORITY_OPTIONS}
                    required
                  />
                )}

                {canEdit.includes("category_id") && (
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
                )}

                {canEdit.includes("deadline") && (
                  <Textfield
                    name="deadline"
                    label="Deadline"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                )}

                <Button
                  loading={loading}
                  disabled={loading}
                  color="secondary"
                  sx={{ alignSelf: "flex-start" }}
                  endIcon={<KeyboardArrowRightIcon />}
                  disableElevation
                >
                  Save Changes
                </Button>

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </FormFields>
            </FormikForm>
          </Formik>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default TicketEditAccordion;
