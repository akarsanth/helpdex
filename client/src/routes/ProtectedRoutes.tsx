import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import { setMessage } from "../redux/store/message/message-slice";

interface ProtectedRoutesProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional: if not passed, allow any logged-in user
}

// Component
const ProtectedRoutes = ({ children, allowedRoles }: ProtectedRoutesProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  // checking the logged in state
  // the logged in state is already verfied here
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    dispatch(
      setMessage({
        message: "Not authorized to access this route",
        type: "error",
      })
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
