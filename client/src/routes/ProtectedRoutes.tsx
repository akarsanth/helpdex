import { useSelector, useDispatch } from "react-redux";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";
import type { AppDispatch } from "../redux/store";
import { setMessage } from "../redux/store/message/message-slice";

interface ProtectedRoutesProps {
  allowedRoles?: string[]; // Optional: If not provided, any logged-in user is allowed
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ allowedRoles }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  console.log(isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    dispatch(
      setMessage({
        message: "Not authorized to access this route",
        type: "error",
      })
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
