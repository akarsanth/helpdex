import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
      <Typography variant="h3" gutterBottom>
        🚫 Unauthorized
      </Typography>
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
