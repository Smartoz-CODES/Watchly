import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Paperclip,
  Users,
  X,
  Send,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { useStatusUpdate } from "../hooks/use-status-update";
import { useCommunity } from "../hooks/use-community";
import { useIncidents } from "../hooks/use-incidents";
import { useToast } from "../hooks/use-toast";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import StatusHistoryTimeline from "../components/StatusHistoryTimeline/StatusHistoryTimeline";
import ErrorState from "../components/ErrorState/ErrorState";
import type { Incident } from "../types/incident";
import { incidentsApi, isApiError } from "../lib/api";
import { incidentTitleFrom } from "../lib/incident-title";
import styles from "./AdminReviewPage.module.css";

interface Corroborator {
  name: string;
  timestamp: string;
}

const INITIAL_CORROBORATOR_COUNT = 5;

type Decision = "verified" | "notVerified" | null;

const buildSmsPreview = (category: string, communityName: string) =>
  `Watchly: A ${category} incident in ${communityName} has been verified. Open the app for details.`;

const AdminReviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useCommunity();
  const { fetchIncidentDetail } = useIncidents();
  const { updateStatus, loading } = useStatusUpdate();
  const { showToast } = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [corroborators, setCorroborators] = useState<Corroborator[]>([]);

  const [decision, setDecision] = useState<Decision>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [resolveNote, setResolveNote] = useState("");
  const [showMoreCorroborators, setShowMoreCorroborators] = useState(false);
  const [showVerifyConfirmDialog, setShowVerifyConfirmDialog] = useState(false);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadIncident = useCallback(async () => {
    if (!id) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const [incidentData, corroboratorData] = await Promise.all([
        fetchIncidentDetail(id),
        incidentsApi.corroborators(id, 1, 100),
      ]);
      setIncident(incidentData);
      setCorroborators(corroboratorData);
    } catch (err) {
      setPageError(isApiError(err) ? err.message : "Failed to load incident");
    } finally {
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Fetch-on-mount/param-change: a genuine synchronization with the
    // server, not a "derive state from props" antipattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIncident();
  }, [loadIncident]);

  if (!isAdmin) {
    return null;
  }

  if (pageLoading) {
    return <div className={styles.container}>Loading…</div>;
  }

  if (pageError || !incident) {
    return (
      <div className={styles.container}>
        <ErrorState
          message={pageError ?? "Incident not found."}
          onRetry={loadIncident}
        />
      </div>
    );
  }

  const title = incidentTitleFrom(incident.description);
  const isNoteRequired = decision === "notVerified";
  const canConfirmVerification =
    decision !== null && (!isNoteRequired || verificationNote.trim() !== "");

  const visibleCorroborators = showMoreCorroborators
    ? corroborators
    : corroborators.slice(0, INITIAL_CORROBORATOR_COUNT);
  const additionalCorroboratorCount = Math.max(
    corroborators.length - INITIAL_CORROBORATOR_COUNT,
    0,
  );

  const handleBeginReview = async () => {
    try {
      await updateStatus(incident.incident_id, "Under Review");
      showToast("Review started", "Incident moved to Under Review.", "success");
      navigate("/admin/queue");
    } catch (err) {
      showToast(
        "Failed to update status",
        isApiError(err) ? err.message : "Please try again.",
        "error",
      );
    }
  };

  const handleConfirmVerificationClick = () => {
    if (!canConfirmVerification) return;
    if (decision === "verified") {
      setShowVerifyConfirmDialog(true);
    } else {
      performVerificationUpdate();
    }
  };

  const performVerificationUpdate = async () => {
    setShowVerifyConfirmDialog(false);
    try {
      await updateStatus(
        incident.incident_id,
        decision === "verified" ? "Verified" : "Not Verified",
        verificationNote.trim() || undefined,
      );
      showToast(
        decision === "verified"
          ? "Incident verified"
          : "Incident marked not verified",
        "The reporter and community have been notified.",
        "success",
      );
      navigate("/admin/queue");
    } catch (err) {
      showToast(
        "Failed to update status",
        isApiError(err) ? err.message : "Please try again.",
        "error",
      );
    }
  };

  const handleConfirmResolve = async () => {
    try {
      await updateStatus(
        incident.incident_id,
        "Resolved",
        resolveNote.trim() || undefined,
      );
      showToast(
        "Incident resolved",
        "The community has been notified.",
        "success",
      );
      navigate("/admin/queue");
    } catch (err) {
      showToast(
        "Failed to resolve incident",
        isApiError(err) ? err.message : "Please try again.",
        "error",
      );
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate("/admin/queue")}
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <div className={styles.headerRow}>
              <div className={styles.reporterInfo}>
                <div className={styles.avatarFallback}>
                  {incident.reporter_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <p className={styles.reporterName}>
                    {incident.reporter_name}
                  </p>
                  <p className={styles.metaLine}>
                    {incident.location} .{" "}
                    {formatRelativeTime(incident.created_at)}
                  </p>
                </div>
              </div>
              <StatusBadge status={incident.current_status} size="md" />
            </div>

            <span className={styles.categoryTag}>{incident.category}</span>
            {title && <h1 className={styles.title}>{title}</h1>}
            <p className={styles.description}>{incident.description}</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitleRow}>
              <Paperclip size={16} />
              Submitted Evidence
            </h2>
            {incident.evidence.length === 0 && (
              <p className={styles.evidenceCounter}>No evidence submitted.</p>
            )}
            <div className={styles.evidenceGrid}>
              {incident.evidence.map((item, index) => (
                <button
                  key={item.evidence_id}
                  type="button"
                  className={styles.evidenceThumb}
                  onClick={() => {
                    setEvidenceIndex(index);
                    setLightboxUrl(item.file_url);
                  }}
                >
                  <img src={item.file_url} alt="" />
                </button>
              ))}
            </div>
            {incident.evidence.length > 0 && (
              <div className={styles.evidenceFooter}>
                <p className={styles.evidenceCounter}>
                  Photo {evidenceIndex + 1} of {incident.evidence.length}
                </p>
                <button
                  type="button"
                  className={styles.viewFullSizeLink}
                  onClick={() =>
                    setLightboxUrl(
                      incident.evidence[evidenceIndex]?.file_url ?? null,
                    )
                  }
                >
                  View Full Size
                </button>
              </div>
            )}
            <p className={styles.privacyNote}>
              Evidence is only visible to Admin and is never shared publicly.
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitleRow}>
              <Users size={16} />
              Community Corroboration
            </h2>
            <p className={styles.signalLabel}>
              {corroborators.length} corroboration
              {corroborators.length === 1 ? "" : "s"}
            </p>

            <div className={styles.corroboratorList}>
              {visibleCorroborators.map((c, index) => (
                <div key={`${c.name}-${index}`} className={styles.corroboratorRow}>
                  <div className={styles.corroboratorAvatar}>{c.name[0]}</div>
                  <div className={styles.corroboratorInfo}>
                    <p className={styles.corroboratorName}>{c.name}</p>
                    <p className={styles.corroboratorDate}>
                      {new Date(c.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className={styles.corroboratorTime}>
                    {formatRelativeTime(c.timestamp)}
                  </p>
                </div>
              ))}
            </div>

            {!showMoreCorroborators && additionalCorroboratorCount > 0 && (
              <button
                type="button"
                className={styles.moreCorroborationsLink}
                onClick={() => setShowMoreCorroborators(true)}
              >
                +{additionalCorroboratorCount} more corroborations
                <ChevronDown size={16} />
              </button>
            )}

            <div className={styles.infoNote}>
              <Info size={16} />
              <p>
                Community corroborations strengthens a report, but final
                verification should always be based on available evidence and
                administrator review.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          {incident.current_status === "Reported" && (
            <div className={styles.card}>
              <h2 className={styles.decisionTitle}>Begin Review</h2>
              <p className={styles.decisionBody}>
                Move this incident to Under Review so it can be evaluated.
              </p>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleBeginReview}
                disabled={loading}
              >
                {loading ? "Starting…" : "Begin Review"}
              </button>
            </div>
          )}

          {incident.current_status === "Under Review" && (
            <div className={styles.card}>
              <button
                type="button"
                className={
                  decision === "verified"
                    ? styles.optionCardSelected
                    : styles.optionCard
                }
                onClick={() => setDecision("verified")}
              >
                <CheckCircle2 size={18} className={styles.optionIconVerified} />
                <div>
                  <p className={styles.optionTitle}>Verified Incident</p>
                  <p className={styles.optionBody}>
                    Confirm this incident is credible and alert the community
                    via SMS
                  </p>
                </div>
              </button>

              <button
                type="button"
                className={
                  decision === "notVerified"
                    ? styles.optionCardSelectedNegative
                    : styles.optionCardNegative
                }
                onClick={() => setDecision("notVerified")}
              >
                <XCircle size={18} className={styles.optionIconNotVerified} />
                <div>
                  <p className={styles.optionTitle}>Marked as not verified</p>
                  <p className={styles.optionBody}>
                    The reporter lacks sufficient evidence or is likely
                    inaccurate
                  </p>
                </div>
              </button>

              <label className={styles.fieldLabel}>
                Verification Note{" "}
                {isNoteRequired && (
                  <span className={styles.required}>(Required)</span>
                )}
                {!isNoteRequired && decision === "verified" && (
                  <span className={styles.optionalLabel}> (Optional)</span>
                )}
              </label>
              <textarea
                className={styles.textarea}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder={
                  isNoteRequired
                    ? "Explain why this report is being marked not verified — shared with the reporter."
                    : "Add an optional note."
                }
              />

              {decision === "verified" && (
                <div className={styles.smsPreview}>
                  <p className={styles.smsPreviewLabel}>SMS Preview</p>
                  <p className={styles.smsPreviewBody}>
                    {buildSmsPreview(
                      incident.category,
                      incident.community_name,
                    )}
                  </p>
                </div>
              )}

              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirmVerificationClick}
                disabled={!canConfirmVerification || loading}
              >
                <Send size={16} />
                {loading ? "Submitting…" : "Confirm Verification"}
              </button>
            </div>
          )}

          {incident.current_status === "Verified" && (
            <div className={styles.card}>
              <h2 className={styles.decisionTitle}>Resolve Incident</h2>
              <p className={styles.decisionBody}>
                Mark this incident as fully handled. The community will be
                notified.
              </p>
              <label className={styles.fieldLabel}>
                Resolution Note{" "}
                <span className={styles.optionalLabel}>(Optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Add an optional note."
              />
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirmResolve}
                disabled={loading}
              >
                {loading ? "Resolving…" : "Confirm Resolution"}
              </button>
            </div>
          )}

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

      {showVerifyConfirmDialog && (
        <ConfirmDialog
          title="Verify Incident"
          message="Marking this incident as verified will send an alert to all community members. Continue?"
          confirmLabel="Verify & Notify"
          onConfirm={performVerificationUpdate}
          onCancel={() => setShowVerifyConfirmDialog(false)}
        />
      )}
    </div>
  );
};


const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

export default AdminReviewPage;
