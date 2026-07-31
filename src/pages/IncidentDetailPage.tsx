import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X, Check } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCorroboration } from "../hooks/use-corroboration";
import { useToast } from "../hooks/use-toast";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import CorroborationButton from "../components/CorroborationButton/CorroborationButton";
import StatusHistoryTimeline from "../components/StatusHistoryTimeline/StatusHistoryTimeline";
import type { Incident } from "../types/incident";
import styles from "./IncidentDetailPage.module.css";

// ---------------------------------------------------------------------
// useIncidents.fetchIncidentDetail() is still a stub, so the :id route
// param isn't actually used to fetch anything yet — this renders one
// fixed mock incident regardless of which id is in the URL, same
// approach HomeFeedPage takes with MOCK_INCIDENTS.
//
// reporter_id, reason, and changed_by below are pre-filtered in this mock
// to simulate what the real API is supposed to send for a viewer who is
// neither the reporter nor a Community Admin (reporter_id: null, reason:
// null, changed_by: null) — per the confirmed decision to follow FR-12's
// stricter visibility rule rather than the Figma, which showed the
// reason to everyone regardless of role. The component itself does no
// role-based hiding of its own; it renders exactly what it's given, same
// principle the LLD states for the real API.
// ---------------------------------------------------------------------

const MOCK_INCIDENT: Incident = {
  incident_id: "2",
  reporter_id: null,
  reporter_name: "Anonymous Resident",
  community_id: "c1",
  community_name: "Landmark Estate",
  category: "Suspicious Person",
  other_description: null,
  description:
    "Latest model silver SUV (possibly Toyota Rav4 or similar) seen circling the block for approximately 20 minutes. Driver appeared to be filming houses using a handheld device. No license plate visible due to temporary paper tag that was intentionally partially obscured by a dark frame.",
  location: "Gate 4",
  occurred_at: new Date(Date.now() - 3600000 * 5).toISOString(), // happened 5hrs ago
  created_at: new Date(Date.now() - 7200000).toISOString(), // reported 2hrs ago — 3hrs after it happened
  current_status: "Under Review",
  corroboration_count: 10,
  evidence: [
    {
      evidence_id: "e1",
      file_url:
        "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600",
      file_type: "JPEG",
      created_at: new Date().toISOString(),
    },
    {
      evidence_id: "e2",
      file_url:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
      file_type: "JPEG",
      created_at: new Date().toISOString(),
    },
  ],
  status_history: [
    {
      status: "Reported",
      changed_by: null,
      reason: null,
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      status: "Under Review",
      changed_by: null, // real value would be "Community Admin" if this viewer were an admin; null here since Faith is neither
      reason: null,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  has_user_corroborated: false,
};

const IncidentDetailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { corroborate, loading: corroborateLoading } = useCorroboration();
  const { showToast } = useToast();

  const [incident, setIncident] = useState(MOCK_INCIDENT);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isReporter =
    !!incident.reporter_id && incident.reporter_id === user?.id;
  const isClosed =
    incident.current_status === "Verified" ||
    incident.current_status === "Resolved" ||
    incident.current_status === "Not Verified";

  const closedVariantClass =
    incident.current_status === "Not Verified"
      ? styles.corroborationBoxClosedNegative
      : styles.corroborationBoxClosedPositive;

  const handleCorroborate = async () => {
    try {
      await corroborate(incident.incident_id);
      setIncident((prev) => ({
        ...prev,
        has_user_corroborated: true,
        corroboration_count: prev.corroboration_count + 1,
      }));
      setShowSuccessModal(true);
    } catch {
      // corroborate() is currently a stub that always throws — see
      // hooks/use-corroboration.ts.
      showToast(
        "Corroboration not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error",
      );
    }
  };

  const latestEntry =
    incident.status_history[incident.status_history.length - 1];

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <div className={styles.headerRow}>
              <div className={styles.reporterInfo}>
                <div className={styles.avatarFallback}>AR</div>
                <div>
                  <p className={styles.reporterName}>
                    {incident.reporter_name}
                  </p>
                  <p className={styles.metaLine}>
                    {incident.location} . Reported{" "}
                    {formatRelativeTime(incident.created_at)}
                  </p>
                  <p className={styles.metaLine}>
                    Occurred {formatRelativeTime(incident.occurred_at)}
                  </p>
                </div>
              </div>
              <StatusBadge status={incident.current_status} size="md" />
            </div>

            <span className={styles.categoryTag}>
              {incident.category === "Other" && incident.other_description
                ? `Other — ${incident.other_description}`
                : incident.category}
            </span>

            <h1 className={styles.title}>
              {incidentTitleFrom(incident.description)}
            </h1>
            <p className={styles.description}>{incident.description}</p>

            {incident.evidence.length > 0 && (
              <div className={styles.evidenceGrid}>
                {incident.evidence.map((item) => (
                  <button
                    key={item.evidence_id}
                    type="button"
                    className={styles.evidenceThumb}
                    onClick={() => setLightboxUrl(item.file_url)}
                  >
                    <img src={item.file_url} alt="" />
                  </button>
                ))}
              </div>
            )}

            {!isClosed && (
              <div className={styles.corroborationBoxOpen}>
                <h2 className={styles.corroborationTitle}>
                  Corroboration Action
                </h2>
                <p className={styles.corroborationExplainer}>
                  "I can confirm this incident" is a supporting trust signal for
                  admin review, it does not change the status on its own.
                </p>
                <CorroborationButton
                  incidentStatus={incident.current_status}
                  isReporter={isReporter}
                  hasCorroborated={incident.has_user_corroborated}
                  corroborationCount={incident.corroboration_count}
                  onCorroborate={handleCorroborate}
                  loading={corroborateLoading}
                />
                <CorroborationCountRow count={incident.corroboration_count} />
              </div>
            )}

            {isClosed && (
              <div
                className={`${styles.corroborationBoxClosed} ${closedVariantClass}`}
              >
                <h2 className={styles.corroborationTitle}>
                  Corroboration Closed
                </h2>
                <CorroborationCountRow count={incident.corroboration_count} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Status history</h2>
            <p className={styles.cardSubtitle}>
              Every change is timestamped and recorded for accountability.
            </p>

            <StatusHistoryTimeline
              statusHistory={incident.status_history}
              currentStatus={incident.current_status}
            />
          </div>

          {latestEntry?.reason && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Admin Verification Note</h2>
              <p className={styles.adminNoteBody}>{latestEntry.reason}</p>
              <p className={styles.adminNoteAttribution}>
                {latestEntry.changed_by ?? "Community Admin"} ·{" "}
                {formatTimestamp(latestEntry.timestamp)}
              </p>
            </div>
          )}
        </div>
      </div>

      {lightboxUrl && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={24} />
          </button>
          <img src={lightboxUrl} alt="" className={styles.lightboxImage} />
        </div>
      )}

      {showSuccessModal && (
        <div
          className={styles.overlay}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className={styles.successModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>Corroboration received</h2>
            <p className={styles.successMessage}>
              Your corroboration helps keep the community safe and improves the
              accuracy of incident reporting. Your vigilance matters.
            </p>
            <button
              type="button"
              className={styles.doneButton}
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CorroborationCountRowProps {
  count: number;
}

const CorroborationCountRow = ({ count }: CorroborationCountRowProps) => (
  <div className={styles.avatarRow}>
    <div className={styles.avatarStack}>
      {["A", "B", "C", "D"].map((letter) => (
        <span key={letter} className={styles.avatarCircle}>
          {letter}
        </span>
      ))}
    </div>
    <p className={styles.avatarRowText}>
      + {count} residents have corroborated this report.
    </p>
  </div>
);

const incidentTitleFrom = (description: string) => {
  // No separate "title" field exists on Incident (same gap flagged on
  // MyReportPage) — using the first sentence of the description as a
  // stand-in headline until/unless a real title field exists.
  const firstSentence = description.split(".")[0];
  return firstSentence.length > 60
    ? firstSentence.slice(0, 60) + "…"
    : firstSentence;
};

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const formatTimestamp = (isoDate: string) =>
  new Date(isoDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default IncidentDetailPage;
