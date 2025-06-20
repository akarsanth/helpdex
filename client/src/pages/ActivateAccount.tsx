import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { setMessage } from "../redux/store/message/message-slice";

// MUI
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";

// Custom Component
import FormContainer, { FormLink } from "../components/FormsUI/FormContainer";

// Main Component
function ActivateAccount() {
  const hasActivated = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // when there is no token
    if (!token) {
      const errorMsg = "Activation token not found in URL.";
      setError(errorMsg);
      dispatch(setMessage({ type: "error", message: errorMsg }));
      return;
    }

    // checking is already activate
    if (hasActivated.current) return;

    const activateAccount = async () => {
      hasActivated.current = true;
      setIsLoading(true);
      try {
        const { data } = await axios.post("/api/v1/users/verify-email", {
          activationToken: token,
        });

        setIsLoading(false);
        setSuccess(data.message);

        dispatch(setMessage({ type: "success", message: data.message }));
      } catch (err) {
        let errorMsg = "Activation failed.";
        if (axios.isAxiosError(err)) {
          errorMsg = err.response?.data?.message || errorMsg;
        }

        setIsLoading(false);
        setError(errorMsg);
        dispatch(setMessage({ type: "error", message: errorMsg }));
      }
    };

    activateAccount();
  }, [token, dispatch]);

  return (
    <FormContainer>
      <Typography sx={{ mb: 4, textAlign: "center" }} variant="h6">
        Account Activation
      </Typography>

      <Fade
        in={isLoading}
        style={{ transitionDelay: isLoading ? "0s" : "0ms" }}
        unmountOnExit
      >
        <CircularProgress sx={{ mt: 1 }} />
      </Fade>

      <Box sx={{ my: 2 }}>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Typography variant="body2">Go to Login?</Typography>
        <FormLink to="/login" component={RouterLink} underline="none">
          <Typography variant="body2">Login!</Typography>
        </FormLink>
      </Box>
    </FormContainer>
  );
}

export default ActivateAccount;
