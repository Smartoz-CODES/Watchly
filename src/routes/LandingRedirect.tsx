import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import LandingPage from "../pages/LandingPage";
import LandingLayout from "../layouts/LandingLayout";

// ─── LandingRedirect ──────────────────────────────────────────────────────────
// Handles the root URL (/).
//
// Two possible states:
//
// 1. loading = true  →  Return null (render nothing). The root URL is
//    public so there is no ProtectedRoute above it — we must handle the
//    loading window here directly. Rendering null is preferable to a
//    spinner here because the landing page loads immediately from the
//    CDN and flashing a spinner before showing it would look broken.
//    The window is typically under 100ms on a warm connection.
//
// 2. user exists     →  Navigate to /home with replace: true. A logged-in
//    user visiting the root URL goes directly to their feed. replace: true
//    means the landing page is not added to navigation history — pressing
//    Back from /home won't return them to / and redirect them again.
//
// 3. user is null    →  Render LandingPage inside LandingLayout. The landing
//    page shows the public community listing with State/LGA filters and a
//    Sign Up button in the header. This is the entry point for new users.
//
// TRD Section 12.2: "LandingRedirect: checks authentication state on the
// root URL. If authenticated, redirect to /home. If unauthenticated, render
// the landing page."
// TRD Section 8.4 (RLS): communities are publicly visible — the landing
// page makes anonymous Supabase queries which Supabase RLS permits.

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
