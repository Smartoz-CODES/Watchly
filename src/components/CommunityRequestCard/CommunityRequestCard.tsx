import { useState } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import type { CommunityRequest } from "../../types/community";
import styles from "./CommunityRequestCard.module.css";

interface CommunityRequestCardProps {
  request: CommunityRequest;
  onApprove: (id: string, assignAdmin: boolean) => void;
  onDecline: (id: string, reason: string) => void;
}

type ExpandedPanel = "approve" | "decline" | null;

const CommunityRequestCard = ({
  request,
  onApprove,
  onDecline,
}: CommunityRequestCardProps) => {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);
  const [assignAdmin, setAssignAdmin] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleConfirmApprove = () => {
    onApprove(request.community_id, assignAdmin);
  };

  const handleConfirmDecline = () => {
    if (declineReason.trim() === "") return;
    onDecline(request.community_id, declineReason.trim());
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.name}>{request.name}</p>
          <p className={styles.location}>
            <MapPin size={14} />
            {request.lga}, {request.state}
          </p>
        </div>
      </div>

      {request.description && (
        <p className={styles.description}>{request.description}</p>
      )}

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <User size={14} />
          {request.requested_by.name}
        </span>
        <span className={styles.metaItem}>
          <Calendar size={14} />
          {new Date(request.date_created).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {expandedPanel === null && (
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.approveButton}
            onClick={() => setExpandedPanel("approve")}
          >
            Approve
          </button>
          <button
            type="button"
            className={styles.declineButton}
            onClick={() => setExpandedPanel("decline")}
          >
            Decline
          </button>
        </div>
      )}

      {expandedPanel === "approve" && (
        <div className={styles.expandedPanel}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={assignAdmin}
              onChange={(e) => setAssignAdmin(e.target.checked)}
            />
            Assign requester as Community Admin
          </label>
          <div className={styles.expandedActions}>
            <button
              type="button"
              className={styles.cancelLink}
              onClick={() => setExpandedPanel(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirmApprove}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {expandedPanel === "decline" && (
        <div className={styles.expandedPanel}>
          <label
            className={styles.fieldLabel}
            htmlFor={`decline-reason-${request.community_id}`}
          >
            Reason for declining (required)
          </label>
          <textarea
            id={`decline-reason-${request.community_id}`}
            className={styles.textarea}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <div className={styles.expandedActions}>
            <button
              type="button"
              className={styles.cancelLink}
              onClick={() => setExpandedPanel(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmButtonDestructive}
              disabled={declineReason.trim() === ""}
              onClick={handleConfirmDecline}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRequestCard;
