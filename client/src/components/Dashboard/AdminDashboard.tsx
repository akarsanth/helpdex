import { Box, Typography } from "@mui/material";

const AdminDashboard = () => {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Welcome, Admin.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        User management is available here.
      </Typography>
    </Box>
  );
};

export default AdminDashboard;
