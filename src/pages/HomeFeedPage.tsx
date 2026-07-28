import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, Shield } from "lucide-react";
import { useCommunity } from "../hooks/use-community";
import { useNavigate } from "react-router-dom";
import IncidentCard from "../components/IncidentCard/IncidentCard";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import EmptyState from "../components/EmptyState/EmptyState";
import ErrorState from "../components/ErrorState/ErrorState";
import type {
  Incident,
  IncidentCategory,
  IncidentStatus,
} from "../types/incident";
import styles from "./HomeFeedPage.module.css";

type StatusFilter = "All Statuses" | IncidentStatus;
type CategoryFilter = "All Categories" | IncidentCategory;

const STATUS_FILTERS: StatusFilter[] = [
  "All Statuses",
  "Reported",
  "Under Review",
  "Verified",
  "Resolved",
  "Not Verified",
];

const CATEGORY_FILTERS: CategoryFilter[] = [
  "All Categories",
  "Theft",
  "Fire",
  "Suspicious Person",
  "Assault",
  "Break-in",
  "Other",
];

// ---------------------------------------------------------------------
// Two distinct mock sets instead of one, indexed by the active
// community's position in userCommunities — not by community_id, since
// real Supabase IDs won't ever match a hardcoded "c1"/"c2" anyway. This
// is still mocked, not a real per-community fetch, but it means
// switching between any two real communities you've joined now visibly
// changes the feed, instead of always showing the exact same content
// regardless of which community is active.
// ---------------------------------------------------------------------

const MOCK_INCIDENT_SETS: Incident[][] = [
  [
    {
      incident_id: "1",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c1",
      community_name: "Landmark Estate",
      category: "Suspicious Person",
      other_description: null,
      description:
        "Grey vehicle parked by the transformer since morning. Two occupants, not entering any house.",
      location: "Chevron Drive",
      occurred_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      current_status: "Not Verified",
      corroboration_count: 14,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
    {
      incident_id: "2",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c1",
      community_name: "Landmark Estate",
      category: "Suspicious Person",
      other_description: null,
      description:
        "Silver SUV with tinted windows parked near Gate 4 for over 2 hours. Driver has been seen photographing residential entrances. Security notified.",
      location: "Gate 4",
      occurred_at: new Date(Date.now() - 21600000).toISOString(),
      created_at: new Date(Date.now() - 21600000).toISOString(),
      current_status: "Under Review",
      corroboration_count: 5,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
    {
      incident_id: "3",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c1",
      community_name: "Landmark Estate",
      category: "Other",
      other_description: "Infrastructure",
      description:
        "Multiple street lights are non-functional on Olubunmi Drive. Increased darkness poses a safety risk for evening commuters.",
      location: "Olubunmi Drive",
      occurred_at: new Date(Date.now() - 7200000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      current_status: "Verified",
      corroboration_count: 14,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
    {
      incident_id: "4",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c1",
      community_name: "Landmark Estate",
      category: "Other",
      other_description: "Infrastructure",
      description:
        "Multiple street lights are non-functional on Olubunmi Drive. Increased darkness poses a safety risk for evening commuters.",
      location: "Olubunmi Drive",
      occurred_at: new Date(Date.now() - 7200000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      current_status: "Reported",
      corroboration_count: 14,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
  ],
  [
    {
      incident_id: "5",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c2",
      community_name: "City Gate Estate",
      category: "Fire",
      other_description: null,
      description:
        "Small electrical fire near the transformer behind Block C. Contained quickly, no injuries reported.",
      location: "Block C",
      occurred_at: new Date(Date.now() - 10800000).toISOString(),
      created_at: new Date(Date.now() - 10800000).toISOString(),
      current_status: "Verified",
      corroboration_count: 9,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
    {
      incident_id: "6",
      reporter_id: null,
      reporter_name: "Anonymous Resident",
      community_id: "c2",
      community_name: "City Gate Estate",
      category: "Theft",
      other_description: null,
      description:
        "Package reported missing from the front porch of a unit on Palm Close, sometime overnight.",
      location: "Palm Close",
      occurred_at: new Date(Date.now() - 43200000).toISOString(),
      created_at: new Date(Date.now() - 43200000).toISOString(),
      current_status: "Reported",
      corroboration_count: 1,
      evidence: [],
      status_history: [],
      has_user_corroborated: false,
    },
  ],
];

const PAGE_SIZE = 10;

const HomeFeedPage = () => {
  const { activeCommunity, userCommunities } = useCommunity();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!!activeCommunity);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All Statuses");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All Categories");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  // Closes the status dropdown when the user clicks anywhere outside it,
  // matching the same behavior already established in StateLGAFilter.
  useEffect(() => {
    if (!statusDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusDropdownOpen]);

  const loadIncidents = useCallback((communityId: string) => {
    console.debug("Loading incidents for community:", communityId);

    setLoading(true);
    setError(false);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!activeCommunity) return;

    let cleanup: (() => void) | undefined;

    Promise.resolve().then(() => {
      cleanup = loadIncidents(activeCommunity.community_id);
    });

    return () => {
      cleanup?.();
    };
  }, [activeCommunity, loadIncidents]);

  const handleRetry = () => {
    if (!activeCommunity) return;
    loadIncidents(activeCommunity.community_id);
  };

  // Resetting to page one whenever any filter changes. Not using an
  // effect for this on purpose — React's own docs recommend against
  // effects for "adjust state when something else changes," since that's
  // exactly this case. Comparing during render and adjusting state
  // directly is the documented alternative: React re-renders immediately
  // before painting anything, so there's no flash of stale state, and no
  // effect (and no state-set-in-effect concern) involved at all.
  const filterKey = `${searchTerm}|${statusFilter}|${categoryFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  if (!activeCommunity) {
    return (
      <EmptyState
        icon={Shield}
        title="Join a community to see safety updates"
        actionLabel="Find a Community"
        onAction={() => navigate("/communities")}
      />
    );
  }

  const communityIndex = activeCommunity
    ? userCommunities.findIndex(
        (c) => c.community_id === activeCommunity.community_id,
      )
    : -1;
  const activeMockIncidents =
    MOCK_INCIDENT_SETS[communityIndex % MOCK_INCIDENT_SETS.length] ??
    MOCK_INCIDENT_SETS[0];

  const filteredIncidents = activeMockIncidents.filter((incident) => {
    const matchesStatus =
      statusFilter === "All Statuses" ||
      incident.current_status === statusFilter;
    const matchesCategory =
      categoryFilter === "All Categories" ||
      incident.category === categoryFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const visibleIncidents = filteredIncidents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredIncidents.length;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Incident Feed</h1>
          <p className={styles.pageSubtitle}>
            Stay informed about what is happening nearby and review reports
          </p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search reports, incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.statusDropdownWrapper} ref={statusDropdownRef}>
          <button
            type="button"
            className={styles.statusButton}
            onClick={() => setStatusDropdownOpen((prev) => !prev)}
          >
            Status: <strong>{statusFilter}</strong>
            <ChevronDown size={16} />
          </button>

          {statusDropdownOpen && (
            <div className={styles.statusPanel}>
              {STATUS_FILTERS.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={styles.statusOption}
                  onClick={() => {
                    setStatusFilter(status);
                    setStatusDropdownOpen(false);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`${styles.categoryTab} ${
              categoryFilter === cat ? styles.categoryTabActive : ""
            }`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.feedList}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && error && (
          <ErrorState message="Something went wrong." onRetry={handleRetry} />
        )}

        {!loading && !error && filteredIncidents.length === 0 && (
          <EmptyState
            icon={Shield}
            title="No incidents reported in your community yet."
          />
        )}

        {!loading &&
          !error &&
          visibleIncidents.map((incident) => (
            <IncidentCard
              key={incident.incident_id}
              incident={incident}
              onTap={(id) => navigate(`/incidents/${id}`)}
              showCommunityName={false}
            />
          ))}

        {!loading && !error && hasMore && (
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeFeedPage;
