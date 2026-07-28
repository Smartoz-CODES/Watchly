import { useState, useCallback } from "react";
import type { IncidentStatus } from "../types/incident";

export interface UseStatusUpdateReturn {
  updateStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    reason?: string,
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Shell — never checked this session, same treatment as every other
// unbuilt hook. Active code returns safe values so AdminQueuePage and
// AdminReviewPage compile; real draft below, commented out.
export function useStatusUpdate(): UseStatusUpdateReturn {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const updateStatus = useCallback(async () => {
    setLoading(true);
    try {
      throw new Error("useStatusUpdate.updateStatus is not implemented yet");
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND — resolve before uncommenting any of this
=====================================================================

1. Edge Function name for PUT /incidents/:id/status (TRD §11.3) — same
   naming question as every other Edge Function this session.

2. This is the one endpoint in the whole app with real, enforced state-
   machine validation server-side (TRD §4.6/FR-14) — confirm the exact
   422 error shape for an invalid transition, since the UI should never
   attempt one, but a race condition (two admins acting on the same
   incident at once) could still trigger it.

3. Confirm reason is actually rejected/ignored server-side when
   transitioning to anything other than Not Verified, per FR-14 — or
   whether it's silently accepted regardless of transition.

=====================================================================
DRAFT IMPLEMENTATION — matches LLD §6.7 contract, uncomment and adjust
once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

export function useStatusUpdate(): UseStatusUpdateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (incidentId: string, newStatus: IncidentStatus, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: fnError } = await supabase.functions.invoke(
          "update-incident-status", // TODO confirm function name
          { body: { incident_id: incidentId, status: newStatus, reason } }
        );
        if (fnError) throw fnError;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error };
}
*/
