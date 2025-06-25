import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const { user, loading, authChecked } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  if (!authChecked) return <p>Checking authentication...</p>;

  return user?.role === "admin" ? <Outlet /> : <Navigate to="/unauthorized" />;
}
