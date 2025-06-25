import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const PublicRoute = ({children}) => {
  const { user, authChecked } = useContext(AuthContext);
  console.log(authChecked);

  if (!authChecked) return <div>Loading...</div>; // wait for checkAuth

 return user ? <Navigate to="/" /> : children;
};

export default PublicRoute;
