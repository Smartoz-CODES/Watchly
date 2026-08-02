import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  History,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Users,
  ChevronRight,
  Clock,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import ErrorState from "../components/ErrorState/ErrorState";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import { useMyReports } from "../hooks/use-my-reports";
import type { IncidentStatus } from "../types/incident";
import styles from "./MyReportPage.module.css";
import { incidentTitleFrom } from "../lib/incident-title";

type StatusFilter = "All" | IncidentStatus;

const STATUS_TABS: StatusFilter[] = [
  "All",
  "Reported",
  "Under Review",
  "Verified",
  "Resolved",
  "Not Verified",
];

const PAGE_SIZE = 5;

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const MyReportPage = () => {
  const navigate = useNavigate();
  const { reports, loading, error, fetchMyReports } = useMyReports();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const filteredReports = reports.filter(
    (r) => statusFilter === "All" || r.current_status === statusFilter,
  );
  const visibleReports = filteredReports.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReports.length;

  const statTiles = [
    {
      key: "total",
      label: "Total Submitted",
      value: reports.length,
      accent: "teal",
      icon: CheckCircle2,
    },
    {
      key: "underReview",
      label: "Under Review",
      value: reports.filter((r) => r.current_status === "Under Review").length,
      accent: "underReview",
      icon: History,
    },
    {
      key: "verified",
      label: "Verified",
      value: reports.filter((r) => r.current_status === "Verified").length,
      accent: "green",
      icon: CheckCircle2,
    },
    {
      key: "unverified",
      label: "Unverified",
      value: reports.filter((r) => r.current_status === "Not Verified").length,
      accent: "red",
      icon: AlertCircle,
    },
  ] as const;

  const accentClass: Record<(typeof statTiles)[number]["accent"], string> = {
    teal: "accentTeal",
    underReview: "accentUnderReview",
    green: "accentGreen",
    red: "accentRed",
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Report</h1>
      <p className={styles.pageSubtitle}>
        Track the status of incidents you have reported
      </p>

      <div className={styles.statsGrid}>
        {statTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.key} className={styles.statTile}>
              <div className={styles.statTileHeader}>
                <span>{tile.label}</span>
                <span className={styles[accentClass[tile.accent]]}>
                  <Icon size={24} />
                </span>
              </div>
              <p className={styles.statValue}>{tile.value}</p>
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

      {loading && reports.length === 0 && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchMyReports} />
      )}

      {!loading && !error && (
        <>
          <p className={styles.showingCount}>
            Showing {visibleReports.length} of {filteredReports.length} reports
          </p>

          <div className={styles.reportList}>
            {visibleReports.map((report) => (
              <div key={report.incident_id} className={styles.reportRow}>
                <div className={styles.reportRowHeader}>
                  <div className={styles.reportTags}>
                    <span className={styles.reportCode}>
                      {report.display_code}
                    </span>
                    <span className={styles.categoryTag}>
                      {report.category === "Other" && report.other_description
                        ? `Other — ${report.other_description}`
                        : report.category}
                    </span>
                    <StatusBadge
                      status={report.current_status}
                      size="xs"
                      showIcon={false}
                    />
                  </div>
                  <span className={styles.reportTime}>
                    <Clock size={16} />
                    {formatRelativeTime(report.created_at)}
                  </span>
                </div>

                <p className={styles.reportTitle}>
                  {incidentTitleFrom(report.description)}
                </p>

                <div className={styles.reportMetaRow}>
                  <span className={styles.reportLocation}>
                    <MapPin size={18} />
                    {report.location}
                  </span>
                  <span className={styles.communityBadge}>
                    <ShieldCheck size={18} />
                    {report.community_name}
                  </span>
                </div>

                <div className={styles.reportFooter}>
                  <span className={styles.corroborationCount}>
                    <Users size={18} />
                    {report.corroboration_count} corroboration
                  </span>
                  <button
                    type="button"
                    className={styles.viewDetailsLink}
                    onClick={() => navigate(`/incidents/${report.incident_id}`)}
                  >
                    View details
                    <ChevronRight size={18} />
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
        </>
      )}
    </div>
  );
};

export default MyReportPage;
