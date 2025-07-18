import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import ClientDashboard from "../components/Dashboard/ClientDashboard";
import DeveloperDashboard from "../components/Dashboard/DeveloperDashboard";
import QADashboard from "../components/Dashboard/QADashboard";
import type { RootState } from "../redux/store";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;

  if (!role) {
    return (
      <Typography variant="h6">Unauthorized. Please log in again.</Typography>
    );
  }

  switch (role) {
    case "client":
      return <ClientDashboard />;
    case "qa":
      return <QADashboard />;
    case "developer":
      return <DeveloperDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <Typography variant="h6">
          Invalid role. Please contact support.
        </Typography>
      );
  }
};

export default Dashboard;
