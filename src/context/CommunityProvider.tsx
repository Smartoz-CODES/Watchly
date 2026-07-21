import { type ReactNode } from "react";
import {
  CommunityContext,
  type CommunityContextValue,
} from "./CommunityContext";

// ─── Shell ────────────────────────────────────────────────────────────────────
// This is a shell implementation. All values are null/empty/no-ops.
// Full implementation with Supabase calls ships in feature/community-context
// on Day 2. This shell exists so App.tsx can wrap the provider tree without
// import errors, and so Dev B and Dev C can import useCommunity() from Day 1
// without crashing — they will just get null values until Day 2.

interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const value: CommunityContextValue = {
    activeCommunity: null,
    activeMembership: null,
    userCommunities: [],
    isAdmin: false,
    switchCommunity: (() => {}) as (communityId: string) => void,
    // No-op in shell. Full implementation: updates activeCommunity,
    // updates activeMembership, persists communityId to localStorage.
    refreshCommunities: async () => {
      // No-op in shell. Full implementation: re-fetches community_memberships
      // joined with communities from Supabase for the current user.
    },
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
