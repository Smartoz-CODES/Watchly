import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Check,
  XCircle,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import styles from "./AlertFeedPage.module.css";

// ---------------------------------------------------------------------
// Rebuilt against the LLD's actual documented Alert type — no invented
// fields. alert_type is real ('InApp' | 'SMS' | 'WebPush' — SMS excluded
// here per direction to only show Web Push / In App), incident_status is
// real, is_read and incident_id are real. Filter tabs now use real
// incident_status values (Verified/Resolved/Not Verified) instead of an
// invented severity concept the backend had no way to produce.
//
// No dedicated "title" field exists on Incident (same gap already
// flagged on AdminReviewPage and IncidentDetailPage) — incidentTitleFrom
// below is the same derivation pattern used in both of those files, kept
// consistent rather than inventing a fourth version of this logic.
//
// useAlerts() doesn't exist yet — this renders MOCK_ALERTS until it
// does. Swap the mock array for the real fetch once that hook ships.
// ---------------------------------------------------------------------

interface Alert {
  alert_id: string;
  alert_type: "InApp" | "WebPush";
  incident_id: string;
  community_id: string;
  incident_category: string;
  incident_description: string;
  incident_status: "Verified" | "Resolved" | "Not Verified";
  created_at: string;
  is_read: boolean;
}

type FilterTab = "All" | "Verified" | "Resolved" | "Not Verified";

const FILTER_TABS: FilterTab[] = [
  "All",
  "Verified",
  "Resolved",
  "Not Verified",
];

const STATUS_ICON: Record<Alert["incident_status"], typeof ShieldCheck> = {
  Verified: ShieldCheck,
  Resolved: Check,
  "Not Verified": XCircle,
};

const STATUS_ICON_CLASS: Record<Alert["incident_status"], string> = {
  Verified: "iconWrapGreen",
  Resolved: "iconWrapGray",
  "Not Verified": "iconWrapRed",
};

const STATUS_PILL_CLASS: Record<Alert["incident_status"], string> = {
  Verified: "pillGreen",
  Resolved: "pillGray",
  "Not Verified": "pillRed",
};

const CHANNEL_ICON: Record<Alert["alert_type"], typeof Smartphone> = {
  WebPush: Smartphone,
  InApp: MessageSquare,
};

const CHANNEL_LABEL: Record<Alert["alert_type"], string> = {
  WebPush: "Web Push",
  InApp: "In App",
};

const MOCK_ALERTS: Alert[] = [
  {
    alert_id: "1",
    alert_type: "WebPush",
    incident_id: "101",
    community_id: "c1",
    incident_category: "Assault",
    incident_description:
      "Verified armed robbery incident near Ozumba Mbadiwe Road. Suspects fled towards Chevron Drive. Security team and police are on scene.",
    incident_status: "Verified",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_read: false,
  },
  {
    alert_id: "2",
    alert_type: "InApp",
    incident_id: "102",
    community_id: "c1",
    incident_category: "Fire",
    incident_description:
      "The warehouse fire in Trans Amadi has been contained. No casualties reported, smoke is clearing.",
    incident_status: "Resolved",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    is_read: true,
  },
  {
    alert_id: "3",
    alert_type: "WebPush",
    incident_id: "103",
    community_id: "c1",
    incident_category: "Suspicious Person",
    incident_description:
      "Report of a suspicious vehicle parked near Gate 4 for over two hours could not be independently confirmed by available evidence.",
    incident_status: "Not Verified",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    is_read: true,
  },
  {
    alert_id: "4",
    alert_type: "InApp",
    incident_id: "104",
    community_id: "c1",
    incident_category: "Theft",
    incident_description:
      "A package reported missing from a unit on Palm Close has been recovered and returned to the resident.",
    incident_status: "Resolved",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    is_read: true,
  },
];

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

const AlertFeedPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

  const filteredAlerts =
    activeTab === "All"
      ? alerts
      : alerts.filter((a) => a.incident_status === activeTab);

  const handleAlertTap = (alert: Alert) => {
    // Real behavior per FR-17: mark read, then go to the linked incident.
    // TODO: call a real markAlertRead() endpoint once useAlerts exists —
    // for now this is local state only.
    setAlerts((prev) =>
      prev.map((a) =>
        a.alert_id === alert.alert_id ? { ...a, is_read: true } : a,
      ),
    );
    navigate(`/incidents/${alert.incident_id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsRow}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.alertList}>
        {filteredAlerts.map((alert) => {
          const StatusIcon = STATUS_ICON[alert.incident_status];
          const ChannelIcon = CHANNEL_ICON[alert.alert_type];

          return (
            <button
              key={alert.alert_id}
              type="button"
              className={
                alert.is_read
                  ? styles.alertCard
                  : `${styles.alertCard} ${styles.alertCardUnread}`
              }
              onClick={() => handleAlertTap(alert)}
            >
              {!alert.is_read && (
                <span className={styles.unreadDot} aria-hidden="true" />
              )}

              <span
                className={`${styles.iconWrap} ${styles[STATUS_ICON_CLASS[alert.incident_status]]}`}
              >
                <StatusIcon size={20} />
              </span>

              <div className={styles.alertContent}>
                <div className={styles.alertHeaderRow}>
                  <p
                    className={
                      alert.is_read
                        ? styles.alertTitle
                        : styles.alertTitleUnread
                    }
                  >
                    {alert.incident_category}
                    {" — "}
                    {incidentTitleFrom(alert.incident_description)}
                  </p>
                  <span
                    className={`${styles.pill} ${styles[STATUS_PILL_CLASS[alert.incident_status]]}`}
                  >
                    {alert.incident_status}
                  </span>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <ChannelIcon size={14} />
                    {CHANNEL_LABEL[alert.alert_type]}
                  </span>
                  <span className={styles.metaItem}>
                    {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlertFeedPage;
