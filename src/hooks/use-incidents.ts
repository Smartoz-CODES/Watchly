import { useState, useCallback } from "react";
import type { Incident, IncidentCategory } from "../types/incident";

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

// Shell — nothing here talks to Supabase yet. Returns safe no-op values so
// anything that imports this compiles and renders without crashing.
// HomeFeedPage currently doesn't even import this — it's running on its own
// MOCK_INCIDENTS array. Real implementation is drafted below, commented out,
// pending answers from backend (see OPEN QUESTIONS block).
export function useIncidents(): UseIncidentsReturn {
  const [incidents] = useState<Incident[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [hasMore] = useState(false);

  const fetchIncidents = useCallback(async () => {
    // no-op until wired
  }, []);

  const fetchIncidentDetail = useCallback(async (): Promise<Incident> => {
    throw new Error("useIncidents.fetchIncidentDetail is not implemented yet");
  }, []);

  const createIncident = useCallback(async (): Promise<string> => {
    throw new Error("useIncidents.createIncident is not implemented yet");
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

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND — resolve before uncommenting any of this
=====================================================================

1. Edge Function shape: is each endpoint below its own Supabase Edge
   Function (e.g. "create-incident", "list-incidents-by-community"), or
   is this one router-style function that reads a path/method out of the
   request body? The TRD's API spec (§11.3) lists these as REST-style
   paths (POST /incidents, GET /communities/:id/incidents, GET
   /incidents/:id) but supabase.functions.invoke() calls a function by
   name, not a URL path — so the actual invoke() calls below are guesses
   at function names, not confirmed.

2. Response shape for fetchIncidents: does it come back as
   { data: Incident[], total: number } (needed to compute hasMore), or
   just a bare array with pagination handled some other way (a
   Content-Range header, a separate count call, etc.)?

3. Auth: supabase.functions.invoke() attaches the current session's
   access token automatically — confirm the Edge Functions actually
   expect and validate it that way, rather than a custom header.

4. Error shape on failure: what does the body look like for a 422 (bad
   category / missing other_description) vs a 429 (rate limit — TRD
   names this specifically as 5 incident reports/hour) vs a 403 (not a
   member of the community)? The draft below just reads error.message
   from the Supabase client, which may not surface the Edge Function's
   actual validation message.

5. Does createIncident's response include just incident_id, or the full
   created Incident object? Draft below assumes just the id, per the
   LLD's documented return type.

=====================================================================
DRAFT IMPLEMENTATION — matches LLD §6.4 contract, uncomment and adjust
once the above is confirmed. Also re-add:
  import { supabase } from "../lib/supabase";
at the top of the file — it's not imported above since the active shell
doesn't need it.
=====================================================================

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
        const { data, error: fnError } = await supabase.functions.invoke(
          "list-incidents", // TODO confirm function name
          { body: { community_id: communityId, page, limit } }
        );
        if (fnError) throw fnError;

        const { incidents: page_incidents, total } = data as {
          incidents: Incident[];
          total: number;
        }; // TODO confirm this is the actual response shape

        setIncidents((prev) =>
          page === 1 ? page_incidents : [...prev, ...page_incidents]
        );
        setHasMore(
          (page === 1 ? page_incidents.length : incidents.length + page_incidents.length) <
            total
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load incidents");
      } finally {
        setLoading(false);
      }
    },
    [incidents.length]
  );

  const fetchIncidentDetail = useCallback(async (incidentId: string): Promise<Incident> => {
    const { data, error: fnError } = await supabase.functions.invoke(
      "get-incident-detail", // TODO confirm function name
      { body: { incident_id: incidentId } }
    );
    if (fnError) throw fnError;
    return data as Incident;
  }, []);

  const createIncident = useCallback(
    async (payload: CreateIncidentInput): Promise<string> => {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-incident", // TODO confirm function name
        { body: payload }
      );
      if (fnError) {
        // TODO confirm this is really how the 429 surfaces here — see
        // open question 4 above. Same rate-limit distinction added to
        // SignupPage's OTP resend and useCorroboration's draft.
        if (fnError.context?.status === 429) {
          throw new Error("RATE_LIMITED");
        }
        throw fnError;
      }
      const { incident_id } = data as { incident_id: string }; // TODO confirm shape
      return incident_id;
    },
    []
  );

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
*/
