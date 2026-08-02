import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

// PlatformAdminRoute
export default function PlatformAdminRoute() {
  const { isPlatformAdmin, loading } = useAuth();
  if (loading) {
    return null;
  }

  if (!isPlatformAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
