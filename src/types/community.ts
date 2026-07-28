export interface Community {
  community_id: string;
  name: string;
  state: string;
  lga: string;
  description: string | null;
  slug: string;
  status: "Pending" | "Active" | "Declined";
  /**
   * No column for this exists anywhere in the TRD's communities table
   * schema (§9.2) — only documented on this frontend type. Currently
   * hardcoded to 0 in CommunityProvider until backend confirms whether
   * this is a real column, a Postgres view, or needs a live count query.
   */
  member_count: number;
  /**
   * Same situation as member_count — no column in the TRD schema.
   * Currently read from the raw community row with a fallback to null;
   * needs backend to confirm the real field name.
   */
  admin_name: string | null;
  /**
   * Same situation as member_count — no column in the TRD schema.
   * CommunityProvider currently falls back through reviewed_at then
   * date_created as a guess at intended semantics (when the community
   * went Active). Needs backend confirmation before this is trusted.
   */
  active_since: string;
}

export interface CommunityMembership {
  membership_id: string;
  community_id: string;
  membership_role: "Member" | "Community Admin";
  sms_alerts_enabled: boolean;
  joined_at: string;
}

export interface CommunityRequest {
  community_id: string;
  name: string;
  state: string;
  lga: string;
  description: string | null;
  status: "Pending" | "Active" | "Declined";
  requested_by: {
    user_id: string;
    name: string;
    email: string;
  };
  date_created: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decline_reason: string | null;
}