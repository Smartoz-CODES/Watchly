import { useState, useCallback } from "react";
import type { Alert } from "../types/alert";

export interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  fetchAlerts: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
}

// Shell — no real implementation exists yet, same situation as
// useCorroboration, useIncidents, and useEvidence. AlertFeedPage.tsx and
// AppLayout.tsx (unreadCount badge) both currently work around this by
// using local mock data / a hardcoded 0 rather than calling this hook at
// all. Swap both callers over once this is real.
export function useAlerts(): UseAlertsReturn {
  const [alerts] = useState<Alert[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const fetchAlerts = useCallback(async () => {
    throw new Error("useAlerts.fetchAlerts is not implemented yet");
  }, []);

  const markAsRead = useCallback(async (alertId: string) => {
    void alertId; // referenced to satisfy no-unused-vars until the real call below uses it
    throw new Error("useAlerts.markAsRead is not implemented yet");
  }, []);

  return { alerts, loading, error, unreadCount, fetchAlerts, markAsRead };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND
=====================================================================

1. Edge Function name / query shape for fetching alerts across every
   community the user has joined (LLD §6.6 — "returns alerts across all
   joined communities, sorted by created_at descending"). Likely a
   Supabase query joining alerts + alert_views scoped to the user's
   community_memberships, rather than a dedicated Edge Function — needs
   confirming which approach the rest of the alert system uses.

2. How is_read is actually derived. LLD says it comes from an
   alert_views join per user — confirm the exact join/query shape so
   fetchAlerts can request it correctly rather than getting is_read back
   as always-false or always-true.

3. markAsRead's real mechanism — does this insert a row into
   alert_views directly via the Supabase client, or call a dedicated
   Edge Function? TRD's API spec (§11.4) shows this as a direct Supabase
   client insert ("supabase.from('alert_views').insert(...)"), not an
   Edge Function — confirm that's still accurate before implementing.

4. alert_type filtering — this session's AlertFeedPage rebuild only
   ever displays 'InApp' | 'WebPush' (SMS alerts arrive outside the app
   entirely, so they're not expected to appear as rows here) — confirm
   whether fetchAlerts should filter SMS-type alerts out server-side, or
   whether the frontend should just ignore them if they come back.

=====================================================================
DRAFT IMPLEMENTATION — matches LLD §6.6 contract, uncomment and adjust
once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("alerts")
        .select("*, alert_views(*)") // TODO confirm join shape for is_read
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAlerts(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const { error: insertError } = await supabase
        .from("alert_views")
        .insert({ alert_id: alertId }); // TODO confirm user_id is implicit via RLS or needs passing explicitly

      if (insertError) throw insertError;

      setAlerts((prev) =>
        prev.map((a) =>
          a.alert_id === alertId ? { ...a, is_read: true } : a,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark alert as read");
      throw err;
    }
  }, []);

  return { alerts, loading, error, unreadCount, fetchAlerts, markAsRead };
}
*/
