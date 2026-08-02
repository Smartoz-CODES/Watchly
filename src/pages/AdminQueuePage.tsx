import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { useCommunity } from "../hooks/use-community";
import { useIncidents } from "../hooks/use-incidents";
import EmptyState from "../components/EmptyState/EmptyState";
import type { IncidentCategory, IncidentStatus } from "../types/incident";
import styles from "./AdminQueuePage.module.css";

const STATUS_LABEL: Record<IncidentStatus, string> = {
  Reported: "Pending",
  "Under Review": "Under review",
  Verified: "Verified",
  Resolved: "Resolved",
  "Not Verified": "Not verified",
};

const STATUS_PILL_CLASS: Record<IncidentStatus, string> = {
  Reported: "pillPending",
  "Under Review": "pillUnderReview",
  Verified: "pillVerified",
  Resolved: "pillResolved",
  "Not Verified": "pillNotVerified",
};

const CATEGORY_FILTERS: ("All Categories" | IncidentCategory)[] = [
  "All Categories",
  "Theft",
  "Fire",
  "Suspicious Person",
  "Assault",
  "Break-in",
  "Other",
];

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const AdminQueuePage = () => {
  const navigate = useNavigate();
  const { activeCommunity, isAdmin } = useCommunity();
  const { incidents, loading, hasMore, fetchIncidents } = useIncidents();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All Statuses" | IncidentStatus
  >("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState<
    "All Categories" | IncidentCategory
  >("All Categories");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadedCommunityId, setLoadedCommunityId] = useState<string | null>(
    null,
  );

  if (activeCommunity && activeCommunity.community_id !== loadedCommunityId) {
    setLoadedCommunityId(activeCommunity.community_id);
    if (page !== 1) setPage(1);
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!activeCommunity) return;
    fetchIncidents(activeCommunity.community_id, 1, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommunity?.community_id]);

  if (!isAdmin) {
    return null;
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
      incident.display_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const isQueueEmpty = !loading && incidents.length === 0;
  const isFilteredEmpty =
    !loading && !isQueueEmpty && filteredIncidents.length === 0;

  const handleReviewClick = (incidentId: string) => {
    navigate(`/admin/review/${incidentId}`);
  };

  const handleLoadMore = () => {
    if (!activeCommunity) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIncidents(activeCommunity.community_id, nextPage, 20);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        {activeCommunity?.name ?? "Dashboard"}
      </h1>
      <p className={styles.pageSubtitle}>
        Active Monitoring . {activeCommunity?.lga} . {activeCommunity?.state}
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Incident Feed</h2>
        <p className={styles.cardSubtitle}>
          Stay informed about what is happening nearby and review reports
        </p>

        <div className={styles.filterRow}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search reports, incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.statusDropdownWrapper}>
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
                {(
                  [
                    "All Statuses",
                    "Reported",
                    "Under Review",
                    "Verified",
                    "Resolved",
                    "Not Verified",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
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

        <p className={styles.reportCountHeading}>
          All Report. {filteredIncidents.length} Incident
        </p>

        {isQueueEmpty && (
          <EmptyState
            imageSrc="/assets/images/admin-review-queue.png"
            title="No reports awaiting review"
            description="New incident reports submitted by community members will appear here for verification."
          />
        )}

        {!isQueueEmpty && (
          <div className={styles.incidentList}>
            {isFilteredEmpty && (
              <p className={styles.reporterText}>
                No incidents match this filter.
              </p>
            )}

            {filteredIncidents.map((incident) => (
              <div key={incident.incident_id} className={styles.incidentRow}>
                <div className={styles.incidentMain}>
                  <p className={styles.incidentTitle}>
                    <span className={styles.incidentCode}>
                      {incident.display_code}
                    </span>{" "}
                    | {incident.category} . {incident.location}
                  </p>
                  <div className={styles.incidentMetaRow}>
                    <span
                      className={`${styles.pill} ${styles[STATUS_PILL_CLASS[incident.current_status]]}`}
                    >
                      {STATUS_LABEL[incident.current_status]}
                    </span>
                    <span className={styles.metaText}>
                      {incident.corroboration_count} Corroborations .{" "}
                      {incident.evidence.length > 0
                        ? `${incident.evidence.length} photos`
                        : "No photos"}{" "}
                      . {formatRelativeTime(incident.created_at)}
                    </span>
                  </div>
                  <p className={styles.reporterText}>
                    Reporter: {incident.reporter_name}
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    incident.current_status === "Reported"
                      ? styles.actionButtonFilled
                      : styles.actionButtonOutlined
                  }
                  onClick={() => handleReviewClick(incident.incident_id)}
                >
                  {incident.current_status === "Reported"
                    ? "Review Now"
                    : "Start Review"}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className={styles.paginationRow}>
            <button
              type="button"
              className={styles.pageNumber}
              onClick={handleLoadMore}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueuePage;
