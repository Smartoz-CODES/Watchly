export interface Community {
  community_id: string;
  name: string;
  state: string;
  lga: string;
  description: string | null;
  slug: string;
  status: "Pending" | "Active" | "Declined";
  member_count: number;
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
