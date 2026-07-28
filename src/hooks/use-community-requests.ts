import { useState, useCallback } from "react";
import type { CommunityRequest } from "../types/community";

export interface UseCommunityRequestsReturn {
  requests: CommunityRequest[];
  loading: boolean;
  fetchPendingRequests: () => Promise<void>;
  approveRequest: (communityId: string, assignAdmin: boolean) => Promise<void>;
  declineRequest: (communityId: string, reason: string) => Promise<void>;
}

// Shell - confirmed empty. Active code returns safe values so
// PlatformAdminPage compiles and renders; real draft below, commented
// out, pending backend answers.
export function useCommunityRequests(): UseCommunityRequestsReturn {
  const [requests] = useState<CommunityRequest[]>([]);
  const [loading] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    // no-op until wired
  }, []);

  const approveRequest = useCallback(async () => {
    throw new Error("useCommunityRequests.approveRequest is not implemented yet");
  }, []);

  const declineRequest = useCallback(async () => {
    throw new Error("useCommunityRequests.declineRequest is not implemented yet");
  }, []);

  return { requests, loading, fetchPendingRequests, approveRequest, declineRequest };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND - resolve before uncommenting any of this
=====================================================================

1. Edge Function names for GET /admin/communities?status=pending,
   approve, and decline (TRD Section 11.2).

2. This endpoint returns 403 for anyone without is_platform_admin=true
   (TRD Section 13.2). Confirm the error shape on that 403.

3. approveRequest's assignAdmin flag - confirm it creates a
   community_memberships row with membership_role='Community Admin'
   for the requester specifically, not some other user.

=====================================================================
DRAFT IMPLEMENTATION - matches LLD Section 6.9 contract, uncomment and
adjust once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

export function useCommunityRequests(): UseCommunityRequestsReturn {
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "list-pending-community-requests"
      );
      if (error) throw error;
      setRequests((data ?? []) as CommunityRequest[]);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(
    async (communityId: string, assignAdmin: boolean) => {
      const { error } = await supabase.functions.invoke(
        "approve-community-request",
        { body: { community_id: communityId, assign_admin: assignAdmin } }
      );
      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.community_id !== communityId));
    },
    []
  );

  const declineRequest = useCallback(async (communityId: string, reason: string) => {
    const { error } = await supabase.functions.invoke(
      "decline-community-request",
      { body: { community_id: communityId, reason } }
    );
    if (error) throw error;
    setRequests((prev) => prev.filter((r) => r.community_id !== communityId));
  }, []);

  return { requests, loading, fetchPendingRequests, approveRequest, declineRequest };
}
*/
