import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import styles from "./ProtectedRoute.module.css";

// ProtectedRoute
//
// Real auth now exists (see src/lib/api.ts), so the temporary demo
// bypass that shipped with the Supabase removal has been retired.

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
