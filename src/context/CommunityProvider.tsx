import { type ReactNode } from "react";
import {
  CommunityContext,
  type CommunityContextValue,
} from "./CommunityContext";

// Shell
// All values are null/empty/no-ops.
// Full implementation with Supabase calls ships in feature/community-context on Day 2.

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
    refreshCommunities: async () => {},
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
