import { createContext } from "react";
import type { Community, CommunityMembership } from "../types/community";

export interface CommunityContextValue {
  activeCommunity: Community | null;
  activeMembership: CommunityMembership | null;
  memberships: CommunityMembership[];
  userCommunities: Community[];
  isAdmin: boolean;
  loading: boolean;
  switchCommunity: (communityId: string) => void;
  refreshCommunities: () => Promise<void>;
}

export const CommunityContext = createContext<CommunityContextValue | null>(
  null,
);