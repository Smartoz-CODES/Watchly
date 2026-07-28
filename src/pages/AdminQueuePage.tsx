import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCommunity } from "../hooks/use-community";
import type { IncidentCategory, IncidentStatus } from "../types/incident";
import styles from "./AdminQueuePage.module.css";

// ---------------------------------------------------------------------
// Real Figma had a genuine inconsistency worth flagging rather than
// copying: recent incidents still at "Reported" status showed a
// "Pending" label with a "Review Now" button, but older ones (2-3 days)
// showed a plain "Reported" label with only a read-only "View Details"
// link — no action at all. Since nothing in the TRD's state machine
// supports incidents losing their reviewability after some age (that
// would functionally lock admins out of ever clearing a backlog), every
// Reported-status incident here gets the same "Pending" + "Review Now"
// treatment regardless of how old it is. "Pending" itself is a display
// label only — the real status underneath is still "Reported", per
// explicit direction not to introduce a new status value.
//
// Mock data below matches the Figma's actual rows. useIncidents is still
// a stub, so this isn't fetching anything real yet — same situation as
// HomeFeedPage.
// ---------------------------------------------------------------------

interface QueueIncident {
  incident_id: string;
  display_code: string;
  category: IncidentCategory;
  location: string;
  current_status: IncidentStatus;
  corroboration_count: number;
  photoCount: number;
  relativeTime: string;
  reporterName: string;
}

const MOCK_QUEUE: QueueIncident[] = [
  {
    incident_id: "1",
    display_code: "INC-1048",
    category: "Suspicious Person",
    location: "Chevron Drive",
    current_status: "Reported",
    corroboration_count: 10,
    photoCount: 2,
    relativeTime: "Today 10:22 AM",
    reporterName: "Mary Isreal",
  },
  {
    incident_id: "2",
    display_code: "INC-1047",
    category: "Theft",
    location: "Ozumba Mbadiwe Road",
    current_status: "Under Review",
    corroboration_count: 11,
    photoCount: 2,
    relativeTime: "Today 11:32 PM",
    reporterName: "Osita Udeh",
  },
  {
    incident_id: "3",
    display_code: "INC-1050",
    category: "Fire",
    location: "Trans Amadi",
    current_status: "Under Review",
    corroboration_count: 8,
    photoCount: 3,
    relativeTime: "1hr ago",
    reporterName: "Arinze Obi",
  },
  {
    incident_id: "4",
    display_code: "INC-1049",
    category: "Other",
    location: "Admiralty Way",
    current_status: "Reported",
    corroboration_count: 0,
    photoCount: 0,
    relativeTime: "2hrs ago",
    reporterName: "Rosemary Edeh",
  },
  {
    incident_id: "5",
    display_code: "INC-1042",
    category: "Fire",
    location: "Gowon Estate",
    current_status: "Reported",
    corroboration_count: 3,
    photoCount: 0,
    relativeTime: "2 days ago",
    reporterName: "Anita James",
  },
  {
    incident_id: "6",
    display_code: "INC-1035",
    category: "Theft",
    location: "21 Road Festac",
    current_status: "Reported",
    corroboration_count: 6,
    photoCount: 0,
    relativeTime: "3 days ago",
    reporterName: "Aziel Destiny",
  },
];

const TOTAL_INCIDENT_COUNT = 81;

const CATEGORY_TABS = [
  "All Categories",
  "Suspicious Activity",
  "Fire outbreak",
  "Vandalism",
  "Theft",
  "Infrastructure",
];

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

const AdminQueuePage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCommunity();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All Statuses" | IncidentStatus
  >("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_TABS[0]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const filteredIncidents = MOCK_QUEUE.filter((incident) => {
    const matchesStatus =
      statusFilter === "All Statuses" ||
      incident.current_status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      incident.display_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReviewClick = (incidentId: string) => {
    navigate(`/admin/review/${incidentId}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Landmark Estate Dashboard</h1>
      <p className={styles.pageSubtitle}>Active Monitoring . Lagos . Nigeria</p>

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
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={
                categoryFilter === cat
                  ? styles.categoryTabActive
                  : styles.categoryTab
              }
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className={styles.reportCountHeading}>
          All Report. {TOTAL_INCIDENT_COUNT} Incident
        </p>

        <div className={styles.incidentList}>
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
                    {incident.photoCount > 0
                      ? `${incident.photoCount} photos`
                      : "No photos"}{" "}
                    . {incident.relativeTime}
                  </span>
                </div>
                <p className={styles.reporterText}>
                  Reporter: {incident.reporterName}
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

        <div className={styles.paginationRow}>
          <p className={styles.paginationText}>
            Showing {filteredIncidents.length} of {TOTAL_INCIDENT_COUNT}{" "}
            incident
          </p>
          <div className={styles.paginationControls}>
            <button type="button" className={styles.pageArrow} disabled>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={styles.pageNumberActive}>
              1
            </button>
            <button type="button" className={styles.pageNumber}>
              2
            </button>
            <button type="button" className={styles.pageNumber}>
              3
            </button>
            <span className={styles.pageEllipsis}>...</span>
            <button type="button" className={styles.pageNumber}>
              6
            </button>
            <button type="button" className={styles.pageArrow}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueuePage;
