import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  History,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  ShieldCheck,
  Users,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import type { IncidentCategory, IncidentStatus } from "../types/incident";
import styles from "./MyReportPage.module.css";

// ---------------------------------------------------------------------
// Nothing on this page has a real data source yet:
//
// - No hook fetches "reports submitted by the current user" anywhere.
//   useIncidents.fetchIncidents() takes a community_id, not a user_id —
//   this page needs a different query entirely (or a new parameter on
//   that same hook), and it doesn't exist in the LLD's contract.
// - The four stat tiles (counts + trend percentages vs. last month) are
//   aggregates that don't exist on the Incident type or anywhere in the
//   schema.
// - The "#WTH-2026-0847"-style reference code on each row isn't part of
//   the Incident type either — incident_id is presumably a raw UUID.
//   Whether a human-readable code like this gets generated, and by whom
//   (frontend formatting vs. a real backend-assigned field), is an open
//   question.
// - Each row's bold headline ("Unknown vehicle parked near perimeter
//   fence") reads as a distinct title field, but the TRD's Incident type
//   has no separate title — only description. Standing in with a
//   truncated description below until that's confirmed one way or another.
//
// Everything below is mocked the same way HomeFeedPage mocks incidents.
// ---------------------------------------------------------------------

type StatusFilter = "All" | IncidentStatus;

const STATUS_TABS: StatusFilter[] = [
  "All",
  "Reported",
  "Under Review",
  "Verified",
  "Resolved",
  "Not Verified",
];

interface StatTile {
  key: string;
  label: string;
  value: number;
  trendLabel: string;
  trendDirection: "up" | "down";
  accent: "teal" | "underReview" | "green" | "red";
  icon: typeof CheckCircle2;
}

const STAT_TILES: StatTile[] = [
  {
    key: "total",
    label: "Total Submitted",
    value: 20,
    trendLabel: "+5% vs last month",
    trendDirection: "up",
    accent: "teal",
    icon: CheckCircle2,
  },
  {
    key: "underReview",
    label: "Under Review",
    value: 8,
    trendLabel: "-8% vs last month",
    trendDirection: "down",
    accent: "underReview",
    icon: History,
  },
  {
    key: "verified",
    label: "Verified",
    value: 10,
    trendLabel: "+4% vs last month",
    trendDirection: "up",
    accent: "green",
    icon: CheckCircle2,
  },
  {
    key: "unverified",
    label: "Unverified",
    value: 2,
    trendLabel: "+1% vs last month",
    trendDirection: "up",
    accent: "red",
    icon: AlertCircle,
  },
];

interface MyReportItem {
  incident_id: string;
  display_code: string;
  category: IncidentCategory;
  other_description?: string | null;
  current_status: IncidentStatus;
  title: string;
  location: string;
  community_name: string;
  corroboration_count: number;
  relative_time: string;
}

const MOCK_REPORTS: MyReportItem[] = [
  {
    incident_id: "1",
    display_code: "#WTH-2026-0847",
    category: "Suspicious Person",
    current_status: "Verified",
    title: "Unknown vehicle parked near perimeter fence",
    location: "Near Block D entrance",
    community_name: "Landmark Estate",
    corroboration_count: 10,
    relative_time: "10:22am",
  },
  {
    incident_id: "2",
    display_code: "#WTH-2026-0912",
    category: "Theft",
    current_status: "Reported",
    title: "Motorcycle snatched resident phone at main gate",
    location: "Main gate area",
    community_name: "Landmark Estate",
    corroboration_count: 0,
    relative_time: "1 day",
  },
  {
    incident_id: "3",
    display_code: "#WTH-2026-0930",
    category: "Suspicious Person",
    current_status: "Under Review",
    title: "Two strangers surveying perimeter fence at night",
    location: "East perimeter fence",
    community_name: "Landmark Estate",
    corroboration_count: 0,
    relative_time: "2 days",
  },
  {
    incident_id: "4",
    display_code: "#WTH-2026-0774",
    category: "Break-in",
    current_status: "Resolved",
    title: "Unauthorized person found near children's playground",
    location: "Zone C playground",
    community_name: "Landmark Estate",
    corroboration_count: 12,
    relative_time: "4 days",
  },
  {
    incident_id: "5",
    display_code: "#WTH-2026-1001",
    category: "Other",
    current_status: "Not Verified",
    title: "Unusual noise reported behind Block A late at night",
    location: "Zone C playground",
    community_name: "Landmark Estate",
    corroboration_count: 12,
    relative_time: "2 Mins ago",
  },
  {
    incident_id: "6",
    display_code: "#WTH-2026-1050",
    category: "Other",
    other_description: "Property damage",
    current_status: "Reported",
    title: "Graffiti found on community hall wall",
    location: "Community hall",
    community_name: "Landmark Estate",
    corroboration_count: 1,
    relative_time: "5 days",
  },
  {
    incident_id: "7",
    display_code: "#WTH-2026-1063",
    category: "Fire",
    current_status: "Verified",
    title: "Small electrical fire near transformer, contained quickly",
    location: "Transformer area",
    community_name: "Landmark Estate",
    corroboration_count: 6,
    relative_time: "1 week",
  },
];

const ACCENT_CLASS: Record<StatTile["accent"], string> = {
  teal: "accentTeal",
  underReview: "accentUnderReview",
  green: "accentGreen",
  red: "accentRed",
};

const PAGE_SIZE = 5;

const MyReportPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredReports = MOCK_REPORTS.filter(
    (r) => statusFilter === "All" || r.current_status === statusFilter,
  );
  const visibleReports = filteredReports.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReports.length;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Report</h1>
      <p className={styles.pageSubtitle}>
        Track the status of incidents you have reported
      </p>

      <div className={styles.statsGrid}>
        {STAT_TILES.map((tile) => {
          const Icon = tile.icon;
          const TrendIcon =
            tile.trendDirection === "up" ? TrendingUp : TrendingDown;
          return (
            <div key={tile.key} className={styles.statTile}>
              <div className={styles.statTileHeader}>
                <span>{tile.label}</span>
                <span className={styles[ACCENT_CLASS[tile.accent]]}>
                  <Icon size={16} />
                </span>
              </div>
              <p className={styles.statValue}>{tile.value}</p>
              <p
                className={
                  tile.trendDirection === "up"
                    ? styles.trendUp
                    : styles.trendDown
                }
              >
                <TrendIcon size={12} />
                {tile.trendLabel}
              </p>
            </div>
          );
        })}
      </div>

      <div className={styles.tabsRow}>
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            type="button"
            className={statusFilter === status ? styles.tabActive : styles.tab}
            onClick={() => {
              setStatusFilter(status);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <p className={styles.showingCount}>
        Showing {visibleReports.length} of {filteredReports.length} reports
      </p>

      <div className={styles.reportList}>
        {visibleReports.map((report) => (
          <div key={report.incident_id} className={styles.reportRow}>
            <div className={styles.reportRowHeader}>
              <div className={styles.reportTags}>
                <span className={styles.reportCode}>{report.display_code}</span>
                <span className={styles.categoryTag}>
                  {report.category === "Other" && report.other_description
                    ? `Other — ${report.other_description}`
                    : report.category}
                </span>
                <StatusBadge status={report.current_status} size="sm" />
              </div>
              <span className={styles.reportTime}>{report.relative_time}</span>
            </div>

            <p className={styles.reportTitle}>{report.title}</p>

            <div className={styles.reportMetaRow}>
              <span className={styles.reportLocation}>
                <MapPin size={14} />
                {report.location}
              </span>
              <span className={styles.communityBadge}>
                <ShieldCheck size={14} />
                {report.community_name}
              </span>
            </div>

            <div className={styles.reportFooter}>
              <span className={styles.corroborationCount}>
                <Users size={14} />
                {report.corroboration_count} corroboration
              </span>
              <button
                type="button"
                className={styles.viewDetailsLink}
                onClick={() => navigate(`/incidents/${report.incident_id}`)}
              >
                View details
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <p className={styles.emptyMessage}>
            No reports match this filter yet.
          </p>
        )}
      </div>

      {hasMore && (
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
        >
          Load more
        </button>
      )}
    </div>
  );
};

export default MyReportPage;
