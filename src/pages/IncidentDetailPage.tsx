import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, X, Check } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCorroboration } from "../hooks/use-corroboration";
import { useIncidents } from "../hooks/use-incidents";
import { useToast } from "../hooks/use-toast";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import CorroborationButton from "../components/CorroborationButton/CorroborationButton";
import StatusHistoryTimeline from "../components/StatusHistoryTimeline/StatusHistoryTimeline";
import ErrorState from "../components/ErrorState/ErrorState";
import type { Incident } from "../types/incident";
import { isApiError } from "../lib/api";
import { incidentTitleFrom } from "../lib/incident-title";
import styles from "./IncidentDetailPage.module.css";

const IncidentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { corroborate, loading: corroborateLoading } = useCorroboration();
  const { fetchIncidentDetail } = useIncidents();
  const { showToast } = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadIncident = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidentDetail(id);
      setIncident(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to load incident");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Fetch-on-mount/param-change: a genuine synchronization with the
    // server, not a "derive state from props" antipattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIncident();
  }, [loadIncident]);

  if (loading) {
    return <div className={styles.container}>Loading…</div>;
  }

  if (error || !incident) {
    return (
      <div className={styles.container}>
        <ErrorState
          message={error ?? "Incident not found."}
          onRetry={loadIncident}
        />
      </div>
    );
  }

  const title = incidentTitleFrom(incident.description);
  const isReporter =
    !!incident.reporter_id && incident.reporter_id === user?.user_id;
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
      setIncident((prev) =>
        prev
          ? {
              ...prev,
              has_user_corroborated: true,
              corroboration_count: prev.corroboration_count + 1,
            }
          : prev,
      );
      setShowSuccessModal(true);
    } catch (err) {
      if (isApiError(err) && err.code === "CANNOT_CORROBORATE_OWN_REPORT") {
        showToast("Can't corroborate", "You can't corroborate your own report.", "error");
        return;
      }
      if (isApiError(err) && err.code === "ALREADY_CORROBORATED") {
        showToast("Already corroborated", "You've already corroborated this report.", "info");
        return;
      }
      showToast(
        "Corroboration failed",
        isApiError(err) ? err.message : "Please try again.",
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

            {title && <h1 className={styles.title}>{title}</h1>}
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
