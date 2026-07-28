import { useState, useCallback } from "react";
import type { Community } from "../types/community";

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
  requestCommunity: (data: CommunityRequestInput) => Promise<"created" | "duplicates">;
}

// Returns safe no-op values so anything importing this
// compiles. CommunityRequestModal is currently the only consumer; it reads
// `duplicates` and calls `requestCommunity`, both of which are wired below
// to do nothing meaningful yet. Real implementation is drafted further
// down, commented out, pending answers from backend.
export function useCommunities(): UseCommunitiesReturn {
  const [communities] = useState<Community[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [duplicates] = useState<Community[]>([]);

  const fetchCommunities = useCallback(async () => {
    // no-op until wired
  }, []);

  const joinCommunity = useCallback(async () => {
    throw new Error("useCommunities.joinCommunity is not implemented yet");
  }, []);

  const requestCommunity = useCallback(async (): Promise<"created" | "duplicates"> => {
    throw new Error("useCommunities.requestCommunity is not implemented yet");
  }, []);

  return {
    communities,
    loading,
    error,
    duplicates,
    fetchCommunities,
    joinCommunity,
    requestCommunity,
  };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND
=====================================================================

1. fetchCommunities is meant to be a direct Supabase client query per the
   TRD (§11.2): supabase.from('communities').select('*').eq('status',
   'Active') plus optional .eq('state', ...), .eq('lga', ...),
   .ilike('name', ...) depending on which filters are present. Confirm
   this table/column naming still matches — hasn't been checked against
   the live schema this session.

2. joinCommunity and requestCommunity go through Edge Functions per the
   TRD, not direct table writes — same open question as use-incidents.ts:
   what are these Edge Functions actually named, and do they expect the
   body shapes assumed below?

3. requestCommunity's response: the LLD says it returns 'created' or
   'duplicates', and populates a `duplicates` array when matches are
   found. Confirm the Edge Function's actual response shape — is it
   { status: 'created' | 'duplicates', duplicates?: Community[] }, or
   something else? The draft below guesses at this shape.

4. Name normalization for duplicate checking (lowercase, strip
   punctuation, collapse whitespace, per TRD §9.2) — confirm this
   happens entirely server-side, since the frontend has no reason to
   duplicate that logic.

5. joinCommunity's error cases — TRD doesn't specify what happens if a
   user tries to join a community they're already in, or one that's
   Pending/Declined rather than Active. Confirm expected error responses
   so the UI can show the right message rather than a generic failure.

=====================================================================
DRAFT IMPLEMENTATION — matches LLD §6.3 contract, uncomment and adjust
once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

export function useCommunities(): UseCommunitiesReturn {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Community[]>([]);

  const fetchCommunities = useCallback(async (filters?: CommunityFilters) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("communities").select("*").eq("status", "Active");
      if (filters?.state) query = query.eq("state", filters.state);
      if (filters?.lga) query = query.eq("lga", filters.lga);
      if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setCommunities((data ?? []) as Community[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinCommunity = useCallback(async (communityId: string) => {
    const { error: fnError } = await supabase.functions.invoke(
      "join-community", // TODO confirm function name
      { body: { community_id: communityId } }
    );
    if (fnError) throw fnError;
  }, []);

  const requestCommunity = useCallback(
    async (payload: CommunityRequestInput): Promise<"created" | "duplicates"> => {
      const { data, error: fnError } = await supabase.functions.invoke(
        "request-community", // TODO confirm function name
        { body: payload }
      );
      if (fnError) throw fnError;

      const response = data as { status: "created" | "duplicates"; duplicates?: Community[] };
      // TODO confirm this is the actual response shape
      if (response.status === "duplicates") {
        setDuplicates(response.duplicates ?? []);
      }
      return response.status;
    },
    []
  );

  return {
    communities,
    loading,
    error,
    duplicates,
    fetchCommunities,
    joinCommunity,
    requestCommunity,
  };
}
*/