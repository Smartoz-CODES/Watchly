import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import LandingPage from "../pages/LandingPage";
import LandingLayout from "../layouts/LandingLayout";

// LandingRedirect

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
