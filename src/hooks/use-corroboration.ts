import { useState, useCallback } from "react";

export interface UseCorroborationReturn {
  corroborate: (incidentId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Shell — status of the real file wasn't individually confirmed this
// session, but every other Dev C hook checked so far (useIncidents,
// useEvidence) turned out empty, so this is built the same way rather than
// assumed working. Correct this file directly if it turns out the real
// one already exists with content.
export function useCorroboration(): UseCorroborationReturn {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const corroborate = useCallback(async () => {
    setLoading(true);
    try {
      throw new Error("useCorroboration.corroborate is not implemented yet");
    } finally {
      setLoading(false);
    }
  }, []);

  return { corroborate, loading, error };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND
=====================================================================

1. Edge Function name for POST /incidents/:id/corroborate (TRD §11.3) —
   same naming question as every other Edge Function this session.

2. Error shape for the two documented safety-net cases: own-report
   attempt (403) and duplicate corroboration (409). The UI should never
   let these actually happen since the button doesn't render in those
   states, but the hook still needs to know what the error response looks
   like to show something reasonable if a race condition hits either one.

3. TRD names a specific limit here (20 corroborations/hour, enforced as
   a 429) — confirm the exact error shape so the real implementation
   below can show "you've corroborated too many incidents this hour"
   instead of a generic failure, same distinction added to SignupPage's
   OTP resend for its own documented limit.

=====================================================================
DRAFT IMPLEMENTATION — matches LLD §6.5 contract, uncomment and adjust
once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

export function useCorroboration(): UseCorroborationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const corroborate = useCallback(async (incidentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: fnError } = await supabase.functions.invoke(
        "corroborate-incident", // TODO confirm function name
        { body: { incident_id: incidentId } }
      );
      if (fnError) {
        // TODO confirm this is really how the 429 surfaces here —
        // Edge Function errors may need a different check than
        // fnError.context?.status depending on how Supabase wraps it.
        if (fnError.context?.status === 429) {
          throw new Error("RATE_LIMITED");
        }
        throw fnError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to corroborate");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { corroborate, loading, error };
}
*/
