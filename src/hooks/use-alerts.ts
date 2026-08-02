import { useState, useCallback } from "react";
import type { Alert } from "../types/alert";
import { alertsApi, isApiError } from "../lib/api";

export interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  fetchAlerts: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await alertsApi.list();
      setAlerts(result);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await alertsApi.markRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === alertId ? { ...a, is_read: true } : a)),
      );
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to mark alert as read");
      throw err;
    }
  }, []);

  return { alerts, loading, error, unreadCount, fetchAlerts, markAsRead };
}
