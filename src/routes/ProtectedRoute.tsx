import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps every authenticated page in AppRouter.
//
// Three possible states:
//
// 1. loading = true  →  Show a full-page spinner. This covers the window
//    between the app mounting and Supabase's onAuthStateChange firing with
//    the initial session. Without it, every page refresh would briefly show
//    the login screen even for authenticated users because user is null for
//    a split second before the session is read from localStorage.
//
// 2. user exists     →  Render <Outlet /> (React Router renders the matched
//    child route inside this component).
//
// 3. user is null    →  Navigate to /login with replace: true so the browser
//    back button doesn't loop. Without replace, pressing Back would return
//    to the protected page, which would redirect to /login again, creating
//    an infinite loop in the navigation history.

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "2.4rem",
            height: "2.4rem",
            border: "3px solid #e5e5e5",
            borderTop: "3px solid #8A1F1F",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
