import { useState, useCallback } from "react";
import type { Incident } from "../types/incident";
import { incidentsApi, isApiError } from "../lib/api";
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
      const result = await incidentsApi.mine();
      setReports(result);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to load your reports");
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { reports, loading, error, fetchMyReports };
}
