import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";

// Pages
import ActivateAccount from "../pages/ActivateAccount";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

// layout
import DashboardLayout from "../components/Dashboard/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root path */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
