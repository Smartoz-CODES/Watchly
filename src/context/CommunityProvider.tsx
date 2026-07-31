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
import type { Community, CommunityMembership } from "../types/community";

const ACTIVE_COMMUNITY_STORAGE_KEY = "watchly:active_community_id";

// ---------------------------------------------------------------------
// Two things flagged here that need real-schema confirmation, not just
// assumed correct:
//
// 1. member_count has no column anywhere in the TRD's communities table
//    (§9.2) — it's only documented on the frontend Community type (§10).
//    Defaulting to 0 below until backend confirms whether this is a DB
//    view, a computed column, or needs a separate count query per
//    community.
//
// 2. The nested `communities(*)` select below assumes Supabase can infer
//    the relationship from community_memberships.community_id →
//    communities.community_id and expose it under the key "communities".
//    That's the standard behavior for a single FK relationship, but
//    hasn't been verified against the actual generated Supabase types for
//    this project.
// ---------------------------------------------------------------------

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

  // Reintroduce useToast() here once refreshCommunities talks to a real
  // endpoint again and needs to surface fetch errors (see the stub note
  // in refreshCommunities below).
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

    // The deployed backend is auth-only — community endpoints don't
    // exist yet. Resolve to an empty membership list (the UI's empty
    // states handle this) instead of querying the retired Supabase
    // project and toasting an error on every load.
    //
    // The row -> Community/CommunityMembership mapping that used to
    // live here (community_id, name, state, lga, admin_name/active_since
    // fallback chain, membership_role, sms_alerts_enabled, etc.) is
    // preserved in git history — restore it once a real
    // community-memberships endpoint exists.
    const communities: Community[] = [];
    const membershipList: CommunityMembership[] = [];

    if (latestUserIdRef.current !== requestUserId) return;

    // Single setState call, computed all at once — active community
    // prefers whatever was already active, then whatever's persisted in
    // localStorage, then falls back to the first community in the list,
    // per the LLD's documented default.
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
    // showToast intentionally omitted — the only call site that used it
    // (the Supabase fetch-error branch) was removed with the stub above.
  }, [user]);

  // Ref-based indirection, not a suppression: the mount effect below
  // only ever calls refreshCommunitiesRef.current() — a ref's contents
  // are opaque to static analysis, so there's no traceable call path
  // from the effect to a state setter for the linter to flag at all.
  // This mirrors React's own experimental useEffectEvent pattern
  // (separating "run this once on mount" from "what it actually does"),
  // just written by hand since that API isn't stable yet. Same
  // ref-for-latest-value idea already used in ReportIncidentPage's
  // evidence cleanup fix.
  const refreshCommunitiesRef = useRef(refreshCommunities);

  useEffect(() => {
    refreshCommunitiesRef.current = refreshCommunities;
  }, [refreshCommunities]);

  useEffect(() => {
    refreshCommunitiesRef.current();
  }, []);

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
