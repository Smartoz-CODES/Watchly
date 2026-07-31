import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";

interface DataExportRequest {
  request_id: string;
  status: "Pending" | "Ready" | "Failed";
  requested_at: string;
  download_url: string | null;
}

export function usePrivacy() {
  const { user } = useAuth();
  const [latestRequest, setLatestRequest] = useState<DataExportRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestRequest = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("data_export_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setLatestRequest(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load request status",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requestDataExport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("data_export_requests")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      setLatestRequest(data);
      // TODO: real export generation happens in an Edge Function,
      // triggered here or via a DB webhook — not built yet. Status
      // stays "Pending" until that exists.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    latestRequest,
    loading,
    error,
    fetchLatestRequest,
    requestDataExport,
  };
}
