import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, Plus, Shield } from "lucide-react";
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

const MOCK_INCIDENTS: Incident[] = [
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
];

const HomeFeedPage = () => {
  const { activeCommunity } = useCommunity();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!!activeCommunity);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All Statuses");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All Categories");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

  const filteredIncidents = MOCK_INCIDENTS.filter((incident) => {
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

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Incident Feed</h1>
          <p className={styles.pageSubtitle}>
            Stay informed about what is happening nearby and review reports
          </p>
        </div>
        {/* TODO: confirm with team whether this button belongs in AppLayout's shared top bar instead */}
        <button
          type="button"
          className={styles.reportButton}
          onClick={() => navigate("/report")}
        >
          <Plus size={18} />
          Report
        </button>
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
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.incident_id}
              incident={incident}
              onTap={(id) => navigate(`/incidents/${id}`)}
              showCommunityName={false}
            />
          ))}
      </div>
    </div>
  );
};

export default HomeFeedPage;
