import { createContext } from "react";
import type { Community, CommunityMembership } from "../types/community";

export interface CommunityContextValue {
  activeCommunity: Community | null;
  activeMembership: CommunityMembership | null;
  userCommunities: Community[];
  isAdmin: boolean;
  switchCommunity: (communityId: string) => void;
  refreshCommunities: () => Promise<void>;
}

export const CommunityContext = createContext<CommunityContextValue | null>(
  null,
);
