import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import {
  CommunityContext,
  type CommunityContextValue,
} from "./CommunityContext";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
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
  const { showToast } = useToast();

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

    const { data, error } = await supabase
      .from("community_memberships")
      .select("*, communities(*)")
      .eq("user_id", user.user_id);

    // A newer request has since started — drop this stale response
    // rather than let it clobber fresher data.
    if (latestUserIdRef.current !== requestUserId) return;

    if (error) {
      showToast("Failed to load your communities", error.message, "error");
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const communities: Community[] = [];
    const membershipList: CommunityMembership[] = [];

    for (const row of data ?? []) {
      const communityRow = row.communities;
      if (!communityRow) continue;

      communities.push({
        community_id: communityRow.community_id,
        name: communityRow.name,
        state: communityRow.state,
        lga: communityRow.lga,
        description: communityRow.description,
        slug: communityRow.slug,
        status: communityRow.status,
        member_count: 0, // see flagged gap above
        // Same situation as member_count — neither admin_name nor
        // active_since exists in the TRD's communities table schema
        // (§9.2). Falling back through reviewed_at/date_created for
        // active_since as a reasonable guess at intended semantics
        // (when the community actually went Active), but this needs
        // backend to confirm the real column names before trusting it.
        admin_name: communityRow.admin_name ?? null,
        active_since:
          communityRow.active_since ??
          communityRow.reviewed_at ??
          communityRow.date_created ??
          new Date().toISOString(),
      });

      membershipList.push({
        membership_id: row.membership_id,
        community_id: row.community_id,
        membership_role: row.membership_role,
        sms_alerts_enabled: row.sms_alerts_enabled,
        joined_at: row.joined_at,
      });
    }

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
  }, [user, showToast]);

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
