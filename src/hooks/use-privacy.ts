import { useState, useCallback } from "react";

interface DataExportRequest {
  request_id: string;
  status: "Pending" | "Ready" | "Failed";
  requested_at: string;
  download_url: string | null;
}

export function usePrivacy() {
  const [latestRequest] = useState<DataExportRequest | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchLatestRequest = useCallback(async () => {
    // No-op until the privacy/export data API exists.
  }, []);

  const requestDataExport = useCallback(async () => {
    throw new Error("Data export is not available yet.");
  }, []);

  return {
    latestRequest,
    loading,
    error,
    fetchLatestRequest,
    requestDataExport,
  };
}

/*
import { authedRequest } from "../lib/api";
import { useAuth } from "./use-auth";

export function usePrivacy() {
  const { user } = useAuth();
  const [latestRequest, setLatestRequest] = useState<DataExportRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestRequest = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await authedRequest<DataExportRequest | null>(
        `/api/v1/privacy/export-requests/latest`,
        { method: "GET" },
      );
      setLatestRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request status");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requestDataExport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await authedRequest<DataExportRequest>(
        `/api/v1/privacy/export-requests`,
        { method: "POST" },
      );
      setLatestRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { latestRequest, loading, error, fetchLatestRequest, requestDataExport };
}
*/
