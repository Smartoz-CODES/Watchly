import { useState, useCallback } from "react";
import type { IncidentStatus } from "../types/incident";
import { incidentsApi, isApiError } from "../lib/api";

export interface UseStatusUpdateReturn {
  updateStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    reason?: string,
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useStatusUpdate(): UseStatusUpdateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (incidentId: string, newStatus: IncidentStatus, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await incidentsApi.updateStatus(incidentId, newStatus, reason);
      } catch (err) {
        setError(isApiError(err) ? err.message : "Failed to update status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateStatus, loading, error };
}
