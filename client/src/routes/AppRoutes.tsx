import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";

// Public Pages
import ActivateAccount from "../pages/ActivateAccount";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

// Dashboard Pages
import CreateTicket from "../pages/CreateTicket";
import Categories from "../pages/Categories";
import Statuses from "../pages/Statuses";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import TicketDetail from "../pages/TicketDetail";
import Tickets from "../pages/Tickets";

// Layout
import DashboardLayout from "../components/Dashboard/DashboardLayout";

// Dashboard Route Config
// route definitions
const dashboardRoutes = [
  {
    path: "",
    element: <Dashboard />,
    roles: ["client", "developer", "qa", "admin"],
  },
  { path: "create-ticket", element: <CreateTicket />, roles: ["client"] },
  { path: "my-tickets", element: <Tickets />, roles: ["client"] },
  {
    path: "my-tickets/:ticketId",
    element: <TicketDetail />,
    roles: ["client", "developer", "qa"],
  },
  { path: "assigned", element: <Tickets />, roles: ["developer"] },
  {
    path: "assigned/:ticketId",
    element: <TicketDetail />,
    roles: ["developer"],
  },

  { path: "all-tickets", element: <Tickets />, roles: ["qa"] },
  { path: "all-tickets/:ticketId", element: <TicketDetail />, roles: ["qa"] },
  { path: "categories", element: <Categories />, roles: ["qa"] },
  { path: "statuses", element: <Statuses />, roles: ["qa"] },
  { path: "users", element: <Users />, roles: ["admin"] },
  {
    path: "profile",
    element: <Profile />,
    roles: ["client", "developer", "qa", "admin"],
  },
];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes>
            <DashboardLayout />
          </ProtectedRoutes>
        }
      >
        {dashboardRoutes.map(({ path, element, roles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoutes allowedRoles={roles}>{element}</ProtectedRoutes>
            }
          />
        ))}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
