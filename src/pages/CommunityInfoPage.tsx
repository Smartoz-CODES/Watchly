import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, MessageCircle, Mail } from "lucide-react";
import { useCommunity } from "../hooks/use-community";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import EmptyState from "../components/EmptyState/EmptyState";
import type { Incident } from "../types/incident";
import styles from "./CommunityInfoPage.module.css";

// MOCK DATA FOR NOW, still needs real wiring to backend to define where each of these actually lives. //

const MOCK_ABOUT =
  "Landmark is one the most active residential communities on Watchly. Residents report and corroborate local security incidents, from suspicious activity, to helping community admin make faster and better informed verification decisions. This community has maintained an average admin response time of under 20 minutes.";

const MOCK_GUIDELINES = [
  "All incident reports must be accurate and verifiable. False or misleading reports are subject to account suspension and will be escalated to platform administrators.",
  "Do not include personally identifiable information of individuals without consent. Protect privacy while reporting suspicious activity.",
  "Emergency situations (ongoing threats, fire, medical) must be reported to appropriate authorities (112, Lagos State Emergency) first, then logged on the platform.",
  'Members are encouraged to confirm or dispute reports within their area of knowledge. Three independent confirmations trigger the "Verified" status.',
  "Respectful engagement only. Discriminatory language, harassment, or politically motivated content will result in immediate removal from the community.",
];

const MOCK_STATS = {
  reportsThisMonth: 48,
  verifiedIncidents: 18,
  avgResponseTime: "17m",
};

const MOCK_ADMIN = {
  name: "T. Adebayo",
  adminSince: "July 2026",
  reviews: 142,
  avgResponse: "17m",
  accuracy: "96%",
};

const MOCK_SAFETY_BY_CATEGORY = [
  { label: "Armed Robbery", count: 18 },
  { label: "Suspicious Activity", count: 14 },
  { label: "Vandalism", count: 10 },
  { label: "Fire", count: 5 },
  { label: "Power Outage", count: 2 },
];

const MOCK_SAFETY_BY_STATUS: {
  status: Incident["current_status"];
  count: number;
}[] = [
  { status: "Reported", count: 12 },
  { status: "Under Review", count: 6 },
  { status: "Verified", count: 16 },
  { status: "Resolved", count: 20 },
];

const MOCK_TOTAL_INCIDENT_COUNT = 81;

const MOCK_RECENT_INCIDENTS: Pick<
  Incident,
  | "incident_id"
  | "category"
  | "location"
  | "current_status"
  | "corroboration_count"
>[] = [
  {
    incident_id: "INC-1048",
    category: "Suspicious Person",
    location: "Chevron Drive",
    current_status: "Verified",
    corroboration_count: 10,
  },
  {
    incident_id: "INC-1047",
    category: "Theft",
    location: "Ozumba Mbadiwe Road",
    current_status: "Under Review",
    corroboration_count: 11,
  },
  {
    incident_id: "INC-1050",
    category: "Fire",
    location: "Trans Amadi",
    current_status: "Under Review",
    corroboration_count: 8,
  },
  {
    incident_id: "INC-1049",
    category: "Break-in",
    location: "Admiralty Way",
    current_status: "Not Verified",
    corroboration_count: 0,
  },
  {
    incident_id: "INC-1042",
    category: "Fire",
    location: "Gowon Estate",
    current_status: "Reported",
    corroboration_count: 3,
  },
];

const CommunityInfoPage = () => {
  const { activeCommunity } = useCommunity();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

  if (!activeCommunity) {
    return (
      <div className={styles.container}>
        <EmptyState
          imageSrc="/assets/images/community-info.png"
          title="No community information available"
          description="Community details and updates will appear here once they are added."
        />
      </div>
    );
  }

  const inviteLink = `${window.location.origin}/c/${activeCommunity.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // clipboard API can fail on insecure contexts / older browsers —
      // fall back to just not showing the "copied" confirmation
    }
  };

  const shareText = `Join ${activeCommunity.name} on Watchly: ${inviteLink}`;

  const handleShareViaMessaging = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  const handleShareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Join ${activeCommunity.name} on Watchly`,
    )}&body=${encodeURIComponent(shareText)}`;
  };

  const maxCategoryCount = Math.max(
    ...MOCK_SAFETY_BY_CATEGORY.map((c) => c.count),
  );

  const statusDotClass: Record<Incident["current_status"], string> = {
    Reported: styles.dotReported,
    "Under Review": styles.dotUnderReview,
    Verified: styles.dotVerified,
    Resolved: styles.dotResolved,
    "Not Verified": styles.dotNotVerified,
  };

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerOverlay}>
          <p className={styles.bannerName}>
            {activeCommunity.name}
            <span className={styles.verifiedPill}>Verified</span>
          </p>
          <p className={styles.bannerLocation}>
            {activeCommunity.lga}, {activeCommunity.state}
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{activeCommunity.member_count}</p>
          <p className={styles.statLabel}>Member</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{MOCK_STATS.reportsThisMonth}</p>
          <p className={styles.statLabel}>Report This Month</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{MOCK_STATS.verifiedIncidents}</p>
          <p className={styles.statLabel}>Verified Incident</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{MOCK_STATS.avgResponseTime}</p>
          <p className={styles.statLabel}>Avg. Response Time</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>About</h2>
            <p className={styles.aboutText}>{MOCK_ABOUT}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Community Guidelines</h2>
            <ol className={styles.guidelinesList}>
              {MOCK_GUIDELINES.map((rule, i) => (
                <li key={i} className={styles.guidelineItem}>
                  <span className={styles.guidelineNumber}>{i + 1}</span>
                  <p>{rule}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.cardTitle}>
                All Report . {MOCK_TOTAL_INCIDENT_COUNT} Incident
              </h2>
              <button
                type="button"
                className={styles.viewAllLink}
                onClick={() => navigate("/home")}
              >
                View all incident
              </button>
            </div>
            <ul className={styles.incidentList}>
              {MOCK_RECENT_INCIDENTS.map((incident) => (
                <li key={incident.incident_id} className={styles.incidentRow}>
                  <div>
                    <p className={styles.incidentTitle}>
                      {incident.incident_id} | {incident.category} .{" "}
                      {incident.location}
                    </p>
                    <p className={styles.incidentMeta}>
                      {incident.corroboration_count} corroboration
                    </p>
                  </div>
                  <StatusBadge status={incident.current_status} size="sm" />
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Safety Overview</h2>

            <p className={styles.safetySubheading}>By Categories</p>
            <div className={styles.barList}>
              {MOCK_SAFETY_BY_CATEGORY.map((c) => (
                <div key={c.label} className={styles.barRow}>
                  <span className={styles.barLabel}>{c.label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(c.count / maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.barCount}>{c.count}</span>
                </div>
              ))}
            </div>

            <p className={styles.safetySubheading}>By Status</p>
            <div className={styles.statusGrid}>
              {MOCK_SAFETY_BY_STATUS.map((s) => (
                <div key={s.status} className={styles.statusBox}>
                  <p className={styles.statusCount}>
                    <span className={statusDotClass[s.status]} />
                    {s.count}
                  </p>
                  <p className={styles.statusLabel}>{s.status}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.sideColumn}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Community Admin</h2>
            <div className={styles.adminRow}>
              <div className={styles.adminAvatar}>{MOCK_ADMIN.name[0]}</div>
              <div>
                <p className={styles.adminName}>
                  {MOCK_ADMIN.name}
                  <span className={styles.adminBadge}>Community Admin</span>
                </p>
                <p className={styles.adminSince}>
                  Admin since {MOCK_ADMIN.adminSince}
                </p>
              </div>
            </div>
            <div className={styles.adminStatsRow}>
              <div>
                <p className={styles.adminStatValue}>{MOCK_ADMIN.reviews}</p>
                <p className={styles.adminStatLabel}>Reviews</p>
              </div>
              <div>
                <p className={styles.adminStatValue}>
                  {MOCK_ADMIN.avgResponse}
                </p>
                <p className={styles.adminStatLabel}>Avg. Response</p>
              </div>
              <div>
                <p className={styles.adminStatValue}>{MOCK_ADMIN.accuracy}</p>
                <p className={styles.adminStatLabel}>Accuracy</p>
              </div>
            </div>
            <p className={styles.adminDisclaimer}>
              All admin decisions are recorded with timestamp and are traceable
              for accountability
            </p>
          </section>

          <section className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>See something suspicious?</h2>
            <p className={styles.ctaDescription}>
              Submit a structured report and help keep your community informed
              and safe
            </p>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={() => navigate("/report")}
            >
              Report an incident
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.cardTitle}>Invite Neighbours</h2>
            </div>
            <p className={styles.inviteDescription}>
              Know someone who lives in {activeCommunity.name}? Share the invite
              link and help grow a safer, better-informed community
            </p>

            <div className={styles.inviteLinkRow}>
              <span className={styles.inviteLinkText}>{inviteLink}</span>
              <button
                type="button"
                className={styles.copyButton}
                onClick={handleCopyLink}
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                {linkCopied ? "Copied" : "Copy"}
              </button>
            </div>
            {linkCopied && (
              <p className={styles.copiedConfirmation}>
                <Check size={14} /> Link copied to clipboard
              </p>
            )}

            <p className={styles.shareViaLabel}>Share Via</p>
            <button
              type="button"
              className={styles.shareRow}
              onClick={handleShareViaMessaging}
            >
              <span className={styles.shareIconMessaging}>
                <MessageCircle size={18} />
              </span>
              <span>
                <span className={styles.shareRowLabel}>
                  Send Via Messaging App
                </span>
                <span className={styles.shareRowDescription}>
                  Share directly in a chat group
                </span>
              </span>
            </button>
            <button
              type="button"
              className={styles.shareRow}
              onClick={handleShareViaEmail}
            >
              <span className={styles.shareIconEmail}>
                <Mail size={18} />
              </span>
              <span>
                <span className={styles.shareRowLabel}>Send Via Email</span>
                <span className={styles.shareRowDescription}>
                  Send invite link by email
                </span>
              </span>
            </button>

            <p className={styles.inviteNote}>
              Invited residents will need to create a Watchly account.
              Membership is granted immediately — no approval required.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommunityInfoPage;
