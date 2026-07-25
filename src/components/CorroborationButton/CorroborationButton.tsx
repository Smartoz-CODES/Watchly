import { ThumbsUp, FileText } from "lucide-react";
import type { IncidentStatus } from "../../types/incident";
import styles from "./CorroborationButton.module.css";

interface CorroborationButtonProps {
  incidentStatus: IncidentStatus;
  isReporter: boolean;
  hasCorroborated: boolean;
  corroborationCount: number;
  onCorroborate: () => void;
  loading: boolean;
}

const CorroborationButton = ({
  incidentStatus,
  isReporter,
  hasCorroborated,
  onCorroborate,
  loading,
}: CorroborationButtonProps) => {
  const isHidden =
    incidentStatus === "Verified" ||
    incidentStatus === "Resolved" ||
    incidentStatus === "Not Verified";

  if (isHidden) {
    return null;
  }

  if (isReporter) {
    return (
      <span className={styles.reporterLabel}>
        <FileText size={16} aria-hidden="true" />
        This is your report
      </span>
    );
  }

  if (hasCorroborated) {
    return (
      <button type="button" className={styles.confirmedButton} disabled>
        <ThumbsUp size={16} aria-hidden="true" />
        Confirmed
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.activeButton}
      onClick={onCorroborate}
      disabled={loading}
    >
      <ThumbsUp size={16} aria-hidden="true" />
      {loading ? "Confirming..." : "I can confirm this."}
    </button>
  );
};

export default CorroborationButton;
