import { useContext } from "react";
import {
  CommunityContext,
  type CommunityContextValue,
} from "../context/CommunityContext";

export function useCommunity(): CommunityContextValue {
  const context = useContext(CommunityContext);

  if (!context) {
    throw new Error("useCommunity must be used inside CommunityProvider");
  }

  return context;
}
