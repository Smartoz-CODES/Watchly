import { useState, useCallback } from "react";
import type { Incident, IncidentCategory } from "../types/incident";
import { incidentsApi, isApiError } from "../lib/api";

export interface CreateIncidentInput {
  community_id: string;
  category: IncidentCategory;
  other_description?: string;
  description: string;
  location: string;
  occurred_at: string;
}

export interface UseIncidentsReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchIncidents: (
    communityId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  fetchIncidentDetail: (incidentId: string) => Promise<Incident>;
  createIncident: (data: CreateIncidentInput) => Promise<string>;
}

export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchIncidents = useCallback(
    async (communityId: string, page = 1, limit = 20) => {
      setLoading(true);
      setError(null);
      try {
        const result = await incidentsApi.listByCommunity(communityId, page, limit);
        setIncidents((prev) => (page === 1 ? result.incidents : [...prev, ...result.incidents]));
        setHasMore(result.hasNextPage);
      } catch (err) {
        setError(isApiError(err) ? err.message : "Failed to load incidents");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchIncidentDetail = useCallback(async (incidentId: string): Promise<Incident> => {
    return incidentsApi.detail(incidentId);
  }, []);

  const createIncident = useCallback(async (data: CreateIncidentInput): Promise<string> => {
    try {
      return await incidentsApi.create(data);
    } catch (err) {
      if (isApiError(err) && err.code === "RATE_LIMIT_EXCEEDED") {
        throw new Error("RATE_LIMITED", { cause: err });
      }
      throw err;
    }
  }, []);

  return {
    incidents,
    loading,
    error,
    hasMore,
    fetchIncidents,
    fetchIncidentDetail,
    createIncident,
  };
}
