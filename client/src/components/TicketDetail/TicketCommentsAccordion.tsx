import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { Formik, Form as FormikForm, useField } from "formik";
import * as Yup from "yup";
import { addComment } from "../../services/comment-service";
import type { Comment } from "../../types/comment";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

// Custom Formik field for MUI TextField
const FormikTextField = ({ name, label }: { name: string; label: string }) => {
  const [field, meta] = useField(name);
  return (
    <TextField
      {...field}
      fullWidth
      multiline
      minRows={3}
      label={label}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
    />
  );
};

interface Props {
  ticketId: string;
  initialComments: Comment[];
}

interface CommentFormValues {
  comment: string;
  is_internal: boolean;
}

// Define color map for roles
const roleColorMap: Record<
  string,
  "primary" | "secondary" | "success" | "warning" | "error" | "info"
> = {
  client: "info",
  developer: "success",
  qa: "warning",
  admin: "error",
};

const TicketCommentsAccordion = ({ ticketId, initialComments }: Props) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const role = currentUser?.role;

  const INITIAL_VALUES: CommentFormValues = {
    comment: "",
    is_internal: false,
  };

  const VALIDATION_SCHEMA = Yup.object({
    comment: Yup.string().trim().required("Comment is required"),
    is_internal: Yup.boolean(),
  });

  const handleSubmit = async (
    values: CommentFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    setSubmitting(true);
    try {
      const created = await addComment({
        ticketId,
        comment: values.comment,
        is_internal: role !== "client" && values.is_internal,
      });
      setComments((prev) => [...prev, created]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit comment");
    } finally {
      setSubmitting(false);
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
        aria-controls="panel1a-content"
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      >
        <Typography fontWeight="bold">Comments</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ borderTop: 1, borderColor: "grey.100", py: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Formik Comment Form */}
        <Box mb={3}>
          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <FormikForm>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormikTextField name="comment" label="Add a comment" />

                  {role !== "client" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.is_internal}
                          onChange={(e) =>
                            setFieldValue("is_internal", e.target.checked)
                          }
                        />
                      }
                      label="Internal comment (visible to QA/Dev only)"
                    />
                  )}

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                    >
                      {submitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </Box>
                </Box>
              </FormikForm>
            )}
          </Formik>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Comments List */}
        {comments.length === 0 ? (
          <Typography>No comments yet.</Typography>
        ) : (
          comments.map((c) => (
            <Box key={c._id} mb={2}>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5}>
                <Box
                  display="flex"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={0.5}
                >
                  <Typography fontWeight="medium" variant="body2">
                    {c.user_id.name}
                  </Typography>

                  <Chip
                    label={c.user_id.role.toUpperCase()}
                    size="small"
                    color={roleColorMap[c.user_id.role] || "default"}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  • {new Date(c.created_at).toLocaleString()}{" "}
                </Typography>
                {c.is_internal ? (
                  <Chip label="Internal" size="small" color={"default"} />
                ) : (
                  ""
                )}
              </Box>

              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {c.comment}
              </Typography>
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default TicketCommentsAccordion;
