import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import PlatformAdminPage from "../pages/PlatformAdminPage";

// ─── PlatformAdminRoute ───────────────────────────────────────────────────────
// Sits inside ProtectedRoute in the router tree, so authentication is
// already guaranteed by the time this component runs. Its only job is
// to check the platform admin flag.
//
// Two possible states:
//
// 1. isPlatformAdmin = true  →  Render PlatformAdminPage directly.
//    This component renders the page rather than <Outlet /> because
//    /platform-admin has no child routes — it is a single destination.
//
// 2. isPlatformAdmin = false →  Navigate to /home with replace: true.
//    A regular user or Community Admin who somehow reaches /platform-admin
//    (by typing it in the address bar) gets silently redirected to their
//    feed. replace: true prevents them from pressing Back and hitting the
//    403 wall again.
//
// TRD Section 12.2: "PlatformAdminRoute: Route guard that checks
// is_platform_admin on the current user. Renders the Platform Admin
// Dashboard if true. Redirects to the home feed if false. Separate from
// ProtectedRoute (which only checks authentication)."

export default function PlatformAdminRoute() {
  const { isPlatformAdmin } = useAuth();

  if (!isPlatformAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <PlatformAdminPage />;
}
