import { useState, useCallback } from "react";
import type { Community } from "../types/community";
import { communitiesApi, isApiError } from "../lib/api";

export interface CommunityFilters {
  state?: string;
  lga?: string;
  search?: string;
}

export interface CommunityRequestInput {
  name: string;
  state: string;
  lga: string;
  description?: string;
}

export interface UseCommunitiesReturn {
  communities: Community[];
  loading: boolean;
  error: string | null;
  duplicates: Community[];
  fetchCommunities: (filters?: CommunityFilters) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  requestCommunity: (
    data: CommunityRequestInput,
  ) => Promise<"created" | "duplicates">;
}

export function useCommunities(): UseCommunitiesReturn {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Community[]>([]);

  const fetchCommunities = useCallback(async (filters?: CommunityFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await communitiesApi.search(filters);
      setCommunities(result);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinCommunity = useCallback(async (communityId: string) => {
    await communitiesApi.join(communityId);
  }, []);

  const leaveCommunity = useCallback(async (communityId: string) => {
    await communitiesApi.leave(communityId);
  }, []);

  const requestCommunity = useCallback(
    async (data: CommunityRequestInput): Promise<"created" | "duplicates"> => {
      const result = await communitiesApi.request(data);
      if (result.status === "duplicates") {
        setDuplicates(result.duplicates);
      }
      return result.status;
    },
    [],
  );

  return {
    communities,
    loading,
    error,
    duplicates,
    fetchCommunities,
    joinCommunity,
    leaveCommunity,
    requestCommunity,
  };
}
