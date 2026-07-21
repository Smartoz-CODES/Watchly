import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import PlatformAdminPage from "../pages/PlatformAdminPage";

// PlatformAdminRoute

export default function PlatformAdminRoute() {
  const { isPlatformAdmin } = useAuth();

  if (!isPlatformAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <PlatformAdminPage />;
}
