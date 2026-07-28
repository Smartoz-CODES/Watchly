import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "../hooks/use-toast";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import StatusHistoryTimeline from "../components/StatusHistoryTimeline/StatusHistoryTimeline";
import type { Incident } from "../types/incident";
import styles from "./AdminReviewPage.module.css";

// ---------------------------------------------------------------------
// Mocked incident — useIncidents.fetchIncidentDetail() is still a stub,
// same situation as IncidentDetailPage. The :id param isn't wired to a
// real fetch yet.
//
// Reporter identity here is the real name (Anonymous Resident only
// applies to non-admin/non-reporter viewers per FR-12) — the Figma this
// was built from actually showed "Anonymous Resident" on this exact
// screen, which contradicts the admin queue one screen prior (which
// correctly showed real names like "Mary Isreal"). Treated that as a
// copy-paste leftover from the resident-facing IncidentDetailPage mockup
// rather than intentional, since hiding reporter identity from an admin
// contradicts FR-12 directly.
//
// SMS preview text uses the TRD's actual documented template (FR-16 —
// category + community name only, no precise location) rather than the
// Figma's more detailed example text, which named a specific vehicle and
// location — that goes further than what FR-16 allows.
// ---------------------------------------------------------------------

interface Corroborator {
  name: string;
  date: string;
  relativeTime: string;
}

const MOCK_INCIDENT: Incident & { reporterRealName: string } = {
  incident_id: "2",
  reporter_id: "u2",
  reporter_name: "Osita Udeh",
  reporterRealName: "Osita Udeh",
  community_id: "c1",
  community_name: "Landmark Estate",
  category: "Suspicious Person",
  other_description: null,
  description:
    "Latest model silver SUV (possibly Toyota Rav4 or similar) seen circling the block for approximately 20 minutes. Driver appeared to be filming houses using a handheld device. No license plate visible due to temporary paper tag that was intentionally partially obscured by a dark frame.",
  location: "Gate 4",
  occurred_at: new Date(Date.now() - 7200000).toISOString(),
  created_at: new Date(Date.now() - 7200000).toISOString(),
  current_status: "Under Review",
  corroboration_count: 11,
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
      changed_by: "Community Admin",
      reason: null,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  has_user_corroborated: false,
};

const MOCK_CORROBORATORS: Corroborator[] = [
  { name: "Aziel Destiny", date: "Jul 22, 2026", relativeTime: "35 Mins ago" },
  { name: "Faith Ola", date: "Jul 22, 2026", relativeTime: "29 Mins ago" },
  { name: "Mikel oji", date: "Jul 22, 2026", relativeTime: "23 Mins ago" },
  { name: "Musa Musa", date: "Jul 22, 2026", relativeTime: "21 Mins ago" },
  { name: "Kate Obi", date: "Jul 22, 2026", relativeTime: "40 Mins ago" },
];
const ADDITIONAL_CORROBORATOR_COUNT = 6;

type Decision = "verified" | "notVerified" | null;

const buildSmsPreview = (category: string, communityName: string) =>
  `Watchly: A ${category} incident in ${communityName} has been verified. Open the app for details.`;

const AdminReviewPage = () => {
  // :id from the route isn't wired to a real fetch yet — same situation
  // as IncidentDetailPage. useIncidents.fetchIncidentDetail() is still a
  // stub, so this renders one fixed mock incident regardless of the URL.
  const navigate = useNavigate();
  const { isAdmin } = useCommunity();
  const { updateStatus, loading } = useStatusUpdate();
  const { showToast } = useToast();

  const [incident] = useState(MOCK_INCIDENT);
  const [decision, setDecision] = useState<Decision>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [resolveNote, setResolveNote] = useState("");
  const [showMoreCorroborators, setShowMoreCorroborators] = useState(false);
  const [showVerifyConfirmDialog, setShowVerifyConfirmDialog] = useState(false);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const isNoteRequired = decision === "notVerified";
  const canConfirmVerification =
    decision !== null && (!isNoteRequired || verificationNote.trim() !== "");

  const handleBeginReview = async () => {
    try {
      await updateStatus(incident.incident_id, "Under Review");
      showToast("Review started", "Incident moved to Under Review.", "success");
      navigate("/admin/queue");
    } catch {
      showToast(
        "Status update not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error",
      );
    }
  };

  const handleConfirmVerificationClick = () => {
    if (!canConfirmVerification) return;
    if (decision === "verified") {
      // Verified triggers an SMS to every community member — this needs
      // an explicit "are you sure" per FR-14, which the inline panel
      // alone doesn't provide.
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
    } catch {
      showToast(
        "Verification not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
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
    } catch {
      showToast(
        "Resolution not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
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
                  {incident.reporterRealName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <p className={styles.reporterName}>
                    {incident.reporterRealName}
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
            <h1 className={styles.title}>
              {incidentTitleFrom(incident.description)}
            </h1>
            <p className={styles.description}>{incident.description}</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitleRow}>
              <Paperclip size={16} />
              Submitted Evidence
            </h2>
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
            <p className={styles.privacyNote}>
              Evidence is only visible to Admin and is never shared publicly.
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitleRow}>
              <Users size={16} />
              Community Corroboration
            </h2>
            <p className={styles.signalLabel}>Strong Community Signal</p>
            <div className={styles.signalBarTrack}>
              <div className={styles.signalBarFill} style={{ width: "72%" }} />
            </div>

            <div className={styles.corroboratorList}>
              {MOCK_CORROBORATORS.map((c) => (
                <div key={c.name} className={styles.corroboratorRow}>
                  <div className={styles.corroboratorAvatar}>{c.name[0]}</div>
                  <div className={styles.corroboratorInfo}>
                    <p className={styles.corroboratorName}>{c.name}</p>
                    <p className={styles.corroboratorDate}>{c.date}</p>
                  </div>
                  <p className={styles.corroboratorTime}>{c.relativeTime}</p>
                </div>
              ))}

              {showMoreCorroborators &&
                Array.from({ length: ADDITIONAL_CORROBORATOR_COUNT }).map(
                  (_, i) => (
                    <div key={`extra-${i}`} className={styles.corroboratorRow}>
                      <div className={styles.corroboratorAvatar}>R</div>
                      <div className={styles.corroboratorInfo}>
                        <p className={styles.corroboratorName}>
                          Resident {i + 6}
                        </p>
                        <p className={styles.corroboratorDate}>Jul 22, 2026</p>
                      </div>
                      <p className={styles.corroboratorTime}>
                        {45 + i} Mins ago
                      </p>
                    </div>
                  ),
                )}
            </div>

            {!showMoreCorroborators && (
              <button
                type="button"
                className={styles.moreCorroborationsLink}
                onClick={() => setShowMoreCorroborators(true)}
              >
                +{ADDITIONAL_CORROBORATOR_COUNT} more corroborations
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

const incidentTitleFrom = (description: string) => {
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

export default AdminReviewPage;
