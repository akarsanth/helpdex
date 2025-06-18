import { useSelector } from "react-redux";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";

const useAuth = (): boolean => {
  return useSelector((state: RootState) => state.auth.isLoggedIn);
};

const ProtectedRoutes = () => {
  const location = useLocation();
  const isLoggedIn = useAuth();

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoutes;
