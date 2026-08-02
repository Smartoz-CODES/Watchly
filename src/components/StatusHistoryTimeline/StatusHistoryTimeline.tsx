import type { IncidentStatus } from "../../types/incident";
import styles from "./StatusHistoryTimeline.module.css";

interface StatusHistoryEntry {
  status: IncidentStatus;
  changed_by: string | null;
  reason: string | null;
  timestamp: string;
}

interface StatusHistoryTimelineProps {
  statusHistory: StatusHistoryEntry[];
  currentStatus: IncidentStatus;
}

const STATUS_EVENT_LABELS: Record<IncidentStatus, string> = {
  Reported: "Reported",
  "Under Review": "Moved to Under review",
  Verified: "Verified",
  Resolved: "Resolved",
  "Not Verified": "Marked Not verified",
};

const NEXT_PENDING_LABEL: Partial<Record<IncidentStatus, string>> = {
  Reported: "Awaiting admin review",
  "Under Review": "Awaiting Verified / Not verified decision",
  Verified: "Resolved",
};

const formatTimestamp = (isoDate: string) =>
  new Date(isoDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const StatusHistoryTimeline = ({
  statusHistory,
  currentStatus,
}: StatusHistoryTimelineProps) => {
  const pendingLabel = NEXT_PENDING_LABEL[currentStatus];

  return (
    <div className={styles.timeline}>
      {statusHistory.map((entry, i) => (
        <div key={i} className={styles.timelineEntry}>
          <span
            className={
              entry.status === "Not Verified"
                ? styles.timelineDotRed
                : styles.timelineDotFilled
            }
          />
          <div>
            <p className={styles.timelineLabel}>
              {STATUS_EVENT_LABELS[entry.status]}
            </p>
            <p className={styles.timelineTimestamp}>
              {formatTimestamp(entry.timestamp)}
              {entry.changed_by && ` · by ${entry.changed_by}`}
            </p>
          </div>
        </div>
      ))}

      {pendingLabel && (
        <div className={styles.timelineEntry}>
          <span className={styles.timelineDotPending} />
          <div>
            <p className={styles.timelineLabel}>{pendingLabel}</p>
            <p className={styles.timelineTimestamp}>Pending</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusHistoryTimeline;
