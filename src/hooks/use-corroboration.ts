import { useState, useCallback } from "react";
import { incidentsApi, isApiError } from "../lib/api";

export interface UseCorroborationReturn {
  corroborate: (incidentId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useCorroboration(): UseCorroborationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const corroborate = useCallback(async (incidentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await incidentsApi.corroborate(incidentId);
    } catch (err) {
      if (isApiError(err) && err.code === "RATE_LIMIT_EXCEEDED") {
        const message = "You've corroborated too many incidents this hour.";
        setError(message);
        throw new Error("RATE_LIMITED", { cause: err });
      }
      setError(isApiError(err) ? err.message : "Failed to corroborate");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { corroborate, loading, error };
}
