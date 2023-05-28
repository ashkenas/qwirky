import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/firebase";

export default function Protect({ children }) {
  const user = useContext(AuthContext);
  const location = useLocation();
  
  if (!user) return <Navigate to={`/?re=${location.pathname}`} />;

  return <>{children}</>;
};
