import { useSelector } from "react-redux";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";

interface ProtectedRoutesProps {
  allowedRoles?: string[]; // Optional: If not provided, any logged-in user is allowed
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ allowedRoles }) => {
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
