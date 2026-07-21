import type { IncidentStatus } from "./incident";

export interface Alert {
  alert_id: string;
  alert_type: "InApp" | "SMS" | "WebPush";
  incident_id: string;
  community_id: string;
  community_name: string;
  incident_category: string;
  incident_status: IncidentStatus;
  created_at: string;
  is_read: boolean; // derived from alert_views join on the backend
}
