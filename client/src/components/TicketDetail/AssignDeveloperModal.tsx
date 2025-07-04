import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { useReducer } from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "../../redux/store/message/message-slice";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Button from "../FormsUI/Button";
import FormFields from "../FormsUI/FormFieldsWrapper";
import SelectWrapper from "../FormsUI/Select";
import ModalWrapper from "../ModalWrapper";
import type { AppDispatch } from "../../redux/store";

// Props
interface Developer {
  _id: string;
  name: string;
}

interface AssignDeveloperModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  developers: Developer[];
  onAssignSuccess: (developerId: string) => void;
}

// Form Values
interface AssignFormValues {
  developerId: string;
}

// Reducer State & Actions
interface State {
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: "REQUEST" }
  | { type: "SUCCESS" }
  | { type: "FAIL"; payload: string };

const initialState: State = { isLoading: false, error: null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "REQUEST":
      return { isLoading: true, error: null };
    case "SUCCESS":
      return { isLoading: false, error: null };
    case "FAIL":
      return { isLoading: false, error: action.payload };
    default:
      return state;
  }
};

const validationSchema = Yup.object({
  developerId: Yup.string().required("Developer is required"),
});

const AssignDeveloperModal = ({
  open,
  onClose,
  developers,
  onAssignSuccess,
}: AssignDeveloperModalProps) => {
  const appDispatch = useDispatch<AppDispatch>();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLoading, error } = state;

  const handleSubmit = async (values: AssignFormValues) => {
    try {
      dispatch({ type: "REQUEST" });

      // Trigger parent update
      await onAssignSuccess(values.developerId);

      dispatch({ type: "SUCCESS" });
      appDispatch(
        setMessage({
          message: "Developer assigned successfully",
          type: "success",
        })
      );
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign developer.";
      dispatch({ type: "FAIL", payload: message });
    }
  };

  return (
    <ModalWrapper open={open} handleClose={onClose}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Assign Developer
      </Typography>

      <Formik<AssignFormValues>
        initialValues={{ developerId: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <FormikForm>
          <FormFields>
            <SelectWrapper
              name="developerId"
              label="Select Developer"
              required
              list={developers.map((dev) => ({
                id: dev._id,
                value: dev._id,
                text: dev.name,
              }))}
            />

            <Button
              color="secondary"
              endIcon={<KeyboardArrowRightIcon />}
              loading={isLoading}
              disableElevation
            >
              Assign Developer
            </Button>
          </FormFields>
        </FormikForm>
      </Formik>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </ModalWrapper>
  );
};

export default AssignDeveloperModal;
