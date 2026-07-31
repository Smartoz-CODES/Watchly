import { useState, useCallback } from "react";
import type { Incident } from "../types/incident";

// Shell — the deployed backend is auth-only; no incident-reports endpoint
// exists yet. Returns safe no-op values so anything that imports this
// compiles and renders without crashing. Real implementation drafted
// below, commented out, ready to uncomment once the data API ships.

export function useMyReports() {
  const [reports] = useState<Incident[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchMyReports = useCallback(async () => {
    // No-op until the incidents data API exists.
  }, []);

  return { reports, loading, error, fetchMyReports };
}

/*
import { authedRequest } from "../lib/api";
import { useAuth } from "./use-auth";

export function useMyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await authedRequest<Incident[]>(
        `/api/v1/incidents?reporterId=${user.user_id}`,
        { method: "GET" },
      );
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your reports");
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { reports, loading, error, fetchMyReports };
}
*/
