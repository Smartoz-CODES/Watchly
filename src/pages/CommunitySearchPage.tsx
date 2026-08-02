import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useCommunities } from "../hooks/use-communities";
import { useCommunity } from "../hooks/use-community";
import { useToast } from "../hooks/use-toast";
import StateLGAFilter from "../components/StateLGAFilter/StateLGAFilter";
import SearchBar from "../components/SearchBar/SearchBar";
import CommunityCard from "../components/CommunityCard/CommunityCard";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import EmptyState from "../components/EmptyState/EmptyState";
import ErrorState from "../components/ErrorState/ErrorState";
import CommunityRequestModal from "../components/CommunityRequestModal/CommunityRequestModal";
import { isApiError } from "../lib/api";
import styles from "./CommunitySearchPage.module.css";

const SEARCH_DEBOUNCE_MS = 300;

const CommunitySearchPage = () => {
  const { communities, loading, error, fetchCommunities, joinCommunity } =
    useCommunities();
  const { refreshCommunities, switchCommunity } = useCommunity();
  const { showToast } = useToast();

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCommunities({
        state: selectedState ?? undefined,
        lga: selectedLga ?? undefined,
        search: searchTerm || undefined,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedState, selectedLga, searchTerm, fetchCommunities]);

  const handleRetry = () => {
    fetchCommunities({
      state: selectedState ?? undefined,
      lga: selectedLga ?? undefined,
      search: searchTerm || undefined,
    });
  };

  const handleJoin = async (communityId: string) => {
    try {
      await joinCommunity(communityId);
      await refreshCommunities();
      switchCommunity(communityId);
    } catch (err) {
      showToast(
        "Failed to join",
        isApiError(err) ? err.message : "Please try again.",
        "error",
      );
    }
  };

  const handleJoinFromModal = async (communityId: string) => {
    await handleJoin(communityId);
    setRequestModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Find your community</h1>
      <p className={styles.pageSubtitle}>
        Search by name, or filter by state and local government area.
      </p>

      <div className={styles.filterRow}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Community name or ID"
        />
        <StateLGAFilter
          selectedState={selectedState}
          selectedLga={selectedLga}
          onStateChange={setSelectedState}
          onLgaChange={setSelectedLga}
        />
      </div>

      <div className={styles.resultsList}>
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && error && (
          <ErrorState
            message="Failed to load communities."
            onRetry={handleRetry}
          />
        )}

        {!loading && !error && communities.length === 0 && (
          <EmptyState
            icon={Plus}
            title="No community found. Request a new one?"
            actionLabel="Request New Community"
            onAction={() => setRequestModalOpen(true)}
          />
        )}

        {!loading &&
          !error &&
          communities.map((community) => (
            <CommunityCard
              key={community.community_id}
              community={community}
              onJoin={handleJoin}
            />
          ))}
      </div>

      {!loading && !error && communities.length > 0 && (
        <p className={styles.requestLinkText}>
          Can't find your community?{" "}
          <button
            type="button"
            className={styles.requestLinkButton}
            onClick={() => setRequestModalOpen(true)}
          >
            Request to create one
          </button>
        </p>
      )}

      {isRequestModalOpen && (
        <CommunityRequestModal
          onClose={() => setRequestModalOpen(false)}
          onJoinCommunity={handleJoinFromModal}
          initialState={selectedState ?? undefined}
          initialLga={selectedLga ?? undefined}
        />
      )}
    </div>
  );
};

export default CommunitySearchPage;
