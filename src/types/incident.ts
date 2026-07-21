export type IncidentCategory =
  | "Theft"
  | "Fire"
  | "Suspicious Person"
  | "Assault"
  | "Break-in"
  | "Other";

export type IncidentStatus =
  | "Reported"
  | "Under Review"
  | "Verified"
  | "Resolved"
  | "Not Verified";

export interface Evidence {
  evidence_id: string;
  file_url: string;
  file_type: "JPEG" | "PNG";
  created_at: string;
}

export interface StatusHistoryEntry {
  status: IncidentStatus;
  changed_by: string | null; // admin name, visible to Community Admins only. Null for residents
  reason: string | null; // visible to original reporter + Community Admins only, null for everyone else
  timestamp: string;
}

export interface Incident {
  incident_id: string;
  reporter_id: string | null; // null for non-reporters and non-admin viewers
  community_id: string;
  community_name: string;
  category: IncidentCategory;
  other_description: string | null; // populated when category is 'Other', null for all other categories
  description: string;
  location: string;
  occurred_at: string;
  created_at: string;
  current_status: IncidentStatus;
  corroboration_count: number;
  evidence: Evidence[];
  status_history: StatusHistoryEntry[];
  has_user_corroborated: boolean; // true if the requesting user has already corroborated this incident
}

export interface Corroboration {
  corroboration_id: string;
  incident_id: string;
  corroborator_id: string;
  timestamp: string;
}

export interface CreateIncidentInput {
  community_id: string;
  category: IncidentCategory;
  other_description?: string; // required when category is 'Other', omitted otherwise
  description: string;
  location: string;
  occurred_at: string;
}
