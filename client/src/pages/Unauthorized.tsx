import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DangerousIcon from "@mui/icons-material/Dangerous";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <DangerousIcon fontSize="large" color="error" />
        <Typography variant="h3">Unauthorized</Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        You do not have permission to access this page.
      </Typography>

      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Box>
  );
};

export default Unauthorized;
