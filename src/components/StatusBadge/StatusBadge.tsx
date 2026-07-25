import { Plus, Clock, ThumbsUp, CheckCheck, ThumbsDown } from "lucide-react";
import type { IncidentStatus } from "../../types/incident";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: "sm" | "md";
}

const config: Record<IncidentStatus, { label: string; icon: typeof Plus; className: string }> = {
  Reported: { label: "Reported", icon: Plus, className: "reported" },
  "Under Review": { label: "Under review", icon: Clock, className: "underReview" },
  Verified: { label: "Verified", icon: ThumbsUp, className: "verified" },
  Resolved: { label: "Resolved", icon: CheckCheck, className: "resolved" },
  "Not Verified": { label: "Not verified", icon: ThumbsDown, className: "notVerified" },
};

const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const { label, icon: Icon, className } = config[status];

  return (
    <span
      className={`${styles.badge} ${styles[className]} ${
        size === "md" ? styles.md : styles.sm
      }`}
    >
      <Icon size={size === "md" ? 16 : 14} className={styles.icon} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
