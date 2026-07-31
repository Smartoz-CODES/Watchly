import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";
import type { Incident } from "../types/incident";

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
      const { data, error: fetchError } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setReports(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your reports",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { reports, loading, error, fetchMyReports };
}
