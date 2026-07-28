import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

// PlatformAdminRoute

export default function PlatformAdminRoute() {
  const { isPlatformAdmin, loading } = useAuth();

  // Missing from the original — without this, the check below can run
  // before the async user-record fetch in AuthProvider has resolved,
  // redirecting away before isPlatformAdmin has its real value.
  if (loading) {
    return null;
  }

  if (!isPlatformAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}