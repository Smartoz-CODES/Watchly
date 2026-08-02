import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Shield } from "lucide-react";
import { useCommunity } from "../hooks/use-community";
import { useIncidents } from "../hooks/use-incidents";
import { useNavigate } from "react-router-dom";
import IncidentCard from "../components/IncidentCard/IncidentCard";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import EmptyState from "../components/EmptyState/EmptyState";
import ErrorState from "../components/ErrorState/ErrorState";
import type { IncidentCategory, IncidentStatus } from "../types/incident";
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

const PAGE_SIZE = 20;

const HomeFeedPage = () => {
  const { activeCommunity } = useCommunity();
  const { incidents, loading, error, hasMore, fetchIncidents } = useIncidents();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All Statuses");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All Categories");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadedCommunityId, setLoadedCommunityId] = useState<string | null>(
    null,
  );

  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  if (activeCommunity && activeCommunity.community_id !== loadedCommunityId) {
    setLoadedCommunityId(activeCommunity.community_id);
    if (page !== 1) setPage(1);
  }

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

  useEffect(() => {
    if (!activeCommunity) return;
    fetchIncidents(activeCommunity.community_id, 1, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommunity?.community_id]);

  const handleRetry = () => {
    if (!activeCommunity) return;
    fetchIncidents(activeCommunity.community_id, 1, PAGE_SIZE);
  };

  const handleLoadMore = () => {
    if (!activeCommunity) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIncidents(activeCommunity.community_id, nextPage, PAGE_SIZE);
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

  const filteredIncidents = incidents.filter((incident) => {
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
            <span className={styles.statusButtonLabel}>Status :</span>
            <span className={styles.statusButtonValue}>
              {statusFilter}
              <ChevronDown size={24} />
            </span>
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
          incidents.length === 0 &&
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && error && (
          <ErrorState message={error} onRetry={handleRetry} />
        )}

        {!loading && !error && filteredIncidents.length === 0 && (
          <EmptyState
            imageSrc="/assets/images/incident-feed.png"
            title="No incident reported yet"
            description="Your community is safe for now. Incidents will appear here as they're reported."
            actionLabel="Report an incident"
            onAction={() => navigate("/report")}
          />
        )}

        {!error &&
          filteredIncidents.map((incident) => (
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
            onClick={handleLoadMore}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeFeedPage;
