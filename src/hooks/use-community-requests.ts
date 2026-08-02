import { useState, useCallback } from "react";
import type { CommunityRequest } from "../types/community";
import { communitiesApi } from "../lib/api";

export interface UseCommunityRequestsReturn {
  requests: CommunityRequest[];
  loading: boolean;
  fetchPendingRequests: () => Promise<void>;
  approveRequest: (communityId: string, assignAdmin: boolean) => Promise<void>;
  declineRequest: (communityId: string, reason: string) => Promise<void>;
}

export function useCommunityRequests(): UseCommunityRequestsReturn {
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await communitiesApi.adminList("Pending");
      setRequests(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(
    async (communityId: string, assignAdmin: boolean) => {
      await communitiesApi.approve(communityId, assignAdmin);
      setRequests((prev) => prev.filter((r) => r.community_id !== communityId));
    },
    [],
  );

  const declineRequest = useCallback(
    async (communityId: string, reason: string) => {
      await communitiesApi.decline(communityId, reason);
      setRequests((prev) => prev.filter((r) => r.community_id !== communityId));
    },
    [],
  );

  return {
    requests,
    loading,
    fetchPendingRequests,
    approveRequest,
    declineRequest,
  };
}
