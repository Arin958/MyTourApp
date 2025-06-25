import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { jwtDecode } from "jwt-decode";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/signin" replace />;
  try {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
  } catch (err) {
    console.error("Invalid JWT token:", err);
    return <Navigate to="/signin" replace />;
  }
};

export default RoleProtectedRoute;