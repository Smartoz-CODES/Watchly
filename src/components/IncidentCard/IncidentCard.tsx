import { Users } from "lucide-react";
import StatusBadge from "../StatusBadge/StatusBadge";
import CorroborationButton from "../CorroborationButton/CorroborationButton";
import type { Incident } from "../../types/incident";
import { incidentTitleFrom } from "../../lib/incident-title";
import styles from "./IncidentCard.module.css";

interface IncidentCardProps {
  incident: Incident;
  onTap: (id: string) => void;
  showCommunityName: boolean;
  isReporter?: boolean;
  onCorroborate?: () => void;
  corroborateLoading?: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

const IncidentCard = ({
  incident,
  onTap,
  showCommunityName,
  isReporter = false,
  onCorroborate = () => {},
  corroborateLoading = false,
}: IncidentCardProps) => {
  const isReportedStatus = incident.current_status === "Reported";
  const title = incidentTitleFrom(incident.description);

  return (
    <div
      className={`${styles.card} ${isReportedStatus ? styles.muted : ""}`}
      onClick={() => onTap(incident.incident_id)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            {getInitials(incident.reporter_name)}
          </div>
          <div className={styles.identityText}>
            <span className={styles.reporterName}>
              {incident.reporter_name}
            </span>
            <span className={styles.metaLine}>
              {incident.location} · {getRelativeTime(incident.created_at)}
              {showCommunityName && ` · ${incident.community_name}`}
            </span>
          </div>
        </div>
        <StatusBadge status={incident.current_status} />
      </div>

      <span className={styles.categoryTag}>
        {incident.category === "Other" && incident.other_description
          ? `Other — ${incident.other_description}`
          : incident.category}
      </span>

      {title && <h3 className={styles.title}>{title}</h3>}

      <p className={styles.description}>{incident.description}</p>

      {isReportedStatus && (
        <span className={styles.unverifiedLabel}>
          Unverified — not yet reviewed
        </span>
      )}

      <div className={styles.footer}>
        <span className={styles.corroborationCount}>
          <Users size={16} aria-hidden="true" />
          {incident.corroboration_count} corroborations
        </span>

        <div onClick={(e) => e.stopPropagation()}>
          <CorroborationButton
            incidentStatus={incident.current_status}
            isReporter={isReporter}
            hasCorroborated={incident.has_user_corroborated}
            corroborationCount={incident.corroboration_count}
            onCorroborate={onCorroborate}
            loading={corroborateLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
