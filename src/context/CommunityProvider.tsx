import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  CommunityContext,
  type CommunityContextValue,
} from "./CommunityContext";
import { useAuth } from "../hooks/use-auth";
import { communitiesApi, isApiError } from "../lib/api";
import type { Community, CommunityMembership } from "../types/community";

const ACTIVE_COMMUNITY_STORAGE_KEY = "watchly:active_community_id";

interface CommunityProviderState {
  userCommunities: Community[];
  memberships: CommunityMembership[];
  activeCommunityId: string | null;
  loading: boolean;
}

interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const { user } = useAuth();

  const [state, setState] = useState<CommunityProviderState>({
    userCommunities: [],
    memberships: [],
    activeCommunityId: null,
    loading: true,
  });

  // Guards against a slow, stale request resolving after a newer one has
  // already started (e.g. rapid logout/login or account switching) and
  // overwriting fresh data with outdated data.
  const latestUserIdRef = useRef<string | null>(null);

  const refreshCommunities = useCallback(async () => {
    const requestUserId = user?.user_id ?? null;
    latestUserIdRef.current = requestUserId;

    if (!user) {
      setState({
        userCommunities: [],
        memberships: [],
        activeCommunityId: null,
        loading: false,
      });
      return;
    }

    let communities: Community[] = [];
    let membershipList: CommunityMembership[] = [];

    try {
      const result = await communitiesApi.mine();
      communities = result.communities;
      membershipList = result.memberships;
    } catch (err) {
      if (!isApiError(err) || err.code !== "AUTHENTICATION_REQUIRED") {
        console.error("Failed to load communities:", err);
      }
    }

    if (latestUserIdRef.current !== requestUserId) return;

    // Single setState call, computed all at once — active community
    // prefers whatever was already active, then whatever's persisted in
    // localStorage, then falls back to the first community in the list.
    setState((prev) => {
      const stillValid =
        prev.activeCommunityId &&
        communities.some((c) => c.community_id === prev.activeCommunityId);

      let nextActiveId = stillValid ? prev.activeCommunityId : null;

      if (!nextActiveId) {
        const storedId = localStorage.getItem(ACTIVE_COMMUNITY_STORAGE_KEY);
        const validStoredId = communities.some(
          (c) => c.community_id === storedId,
        )
          ? storedId
          : null;
        nextActiveId = validStoredId ?? communities[0]?.community_id ?? null;
      }

      return {
        userCommunities: communities,
        memberships: membershipList,
        activeCommunityId: nextActiveId,
        loading: false,
      };
    });
  }, [user]);

  // Ref-based indirection: the mount effect below only ever calls
  // refreshCommunitiesRef.current(), so it can always call the latest
  // version of refreshCommunities without needing it in its own deps.
  const refreshCommunitiesRef = useRef(refreshCommunities);

  useEffect(() => {
    refreshCommunitiesRef.current = refreshCommunities;
  }, [refreshCommunities]);

  useEffect(() => {
    refreshCommunitiesRef.current();
  }, [user]);

  const switchCommunity = useCallback((communityId: string) => {
    setState((prev) => ({ ...prev, activeCommunityId: communityId }));
    localStorage.setItem(ACTIVE_COMMUNITY_STORAGE_KEY, communityId);
  }, []);

  const activeCommunity =
    state.userCommunities.find(
      (c) => c.community_id === state.activeCommunityId,
    ) ?? null;
  const activeMembership =
    state.memberships.find((m) => m.community_id === state.activeCommunityId) ??
    null;
  const isAdmin = activeMembership?.membership_role === "Community Admin";

  const value: CommunityContextValue = {
    activeCommunity,
    activeMembership,
    memberships: state.memberships,
    userCommunities: state.userCommunities,
    isAdmin,
    loading: state.loading,
    switchCommunity,
    refreshCommunities,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
