import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const LandingLayout = lazy(() => import("../layouts/LandingLayout"));

// LandingRedirect
//
// Real auth now exists (see src/lib/api.ts), so the temporary demo
// bypass that shipped with the Supabase removal has been retired.

export default function LandingRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
}
