import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShieldCheck,
  Check,
  Info,
  Building2,
  Clock,
  Users,
} from "lucide-react";
import styles from "./AlertFeedPage.module.css";

// ---------------------------------------------------------------------
// The LLD's documented Alert type (alert_id, alert_type, incident_id,
// community_id, incident_category, incident_status, created_at, is_read)
// doesn't have a title, description, location, or recipient count —
// everything this Figma actually shows. Also: "Urgent" and "Notice" as
// filter categories aren't real IncidentStatus values at all (only
// Reported/Under Review/Verified/Resolved/Not Verified exist per the
// TRD). Built here as a local, page-specific mock shape matching the
// Figma exactly — needs a real backend concept before this is anything
// but decoration.
//
// is_read and incident_id ARE part of the real documented Alert type
// though, so tap-to-mark-read and tap-to-navigate below are built for
// real, just against this local mock rather than a real fetched list —
// same situation as everywhere else still waiting on useAlerts.
// ---------------------------------------------------------------------

type AlertCategory = "Urgent" | "Verified" | "Notice" | "Resolved";
type FilterTab = "All" | AlertCategory;

interface MockAlert {
  id: string;
  incident_id: string;
  category: AlertCategory;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  recipientCount: number;
  is_read: boolean;
}

const FILTER_TABS: FilterTab[] = [
  "All",
  "Urgent",
  "Verified",
  "Notice",
  "Resolved",
];

const INITIAL_ALERTS: MockAlert[] = [
  {
    id: "1",
    incident_id: "101",
    category: "Urgent",
    title: "Armed Robbery . Ozumba Mbadiwe Road",
    description:
      "Verified armed robbery incident. Avoid Ozumba Mbadiwe road Suspects fled towards Chevron Drive, Security team and police are on scene.",
    location: "Ozumba Mbadiwe",
    timestamp: "2026-15-06 12:22pm",
    recipientCount: 1247,
    is_read: false,
  },
  {
    id: "2",
    incident_id: "102",
    category: "Verified",
    title: "Fired Contained . Trans Amadi",
    description:
      "The warehouse fire in Trans Amadi has been contained. No casualties, smoke is clearing. Resident may now open windows.",
    location: "Trans Amadi",
    timestamp: "2026-21-06 2:00pm",
    recipientCount: 120,
    is_read: false,
  },
  {
    id: "3",
    incident_id: "103",
    category: "Resolved",
    title: "Power Outrage . Landmark Estate",
    description:
      "Verified armed robbery incident. Avoid Ozumba Mbadiwe road Suspects fled towards Chevron Drive, Security team and police are on scene.",
    location: "Landmark Estate",
    timestamp: "2026-26-06 2:00pm",
    recipientCount: 100,
    is_read: true,
  },
  {
    id: "4",
    incident_id: "104",
    category: "Notice",
    title: "Increased Patrols . Admiralty Way",
    description:
      "Following the burglary incidents, security patrols have been doubled on Admiralty Way. Report any suspicious activity.",
    location: "Admiralty Way",
    timestamp: "2026-20-07 2:00pm",
    recipientCount: 234,
    is_read: true,
  },
];

const CATEGORY_ICON: Record<AlertCategory, typeof AlertTriangle> = {
  Urgent: AlertTriangle,
  Verified: ShieldCheck,
  Resolved: Check,
  Notice: Info,
};

const CATEGORY_ICON_CLASS: Record<AlertCategory, string> = {
  Urgent: "iconWrapRed",
  Verified: "iconWrapGreen",
  Resolved: "iconWrapGray",
  Notice: "iconWrapAmber",
};

const CATEGORY_PILL_CLASS: Record<AlertCategory, string> = {
  Urgent: "pillRed",
  Verified: "pillGreen",
  Resolved: "pillGray",
  Notice: "pillAmber",
};

const AlertFeedPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [alerts, setAlerts] = useState<MockAlert[]>(INITIAL_ALERTS);

  const filteredAlerts =
    activeTab === "All"
      ? alerts
      : alerts.filter((a) => a.category === activeTab);

  const handleAlertTap = (alert: MockAlert) => {
    // Real behavior per FR-17: mark read, then go to the linked incident.
    // TODO Day 2: this should also call a real markAlertRead() endpoint
    // once useAlerts exists — for now it's local state only, same
    // mocked-until-backend situation as the rest of this page.
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, is_read: true } : a)),
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
          const Icon = CATEGORY_ICON[alert.category];
          return (
            <button
              key={alert.id}
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
                className={`${styles.iconWrap} ${styles[CATEGORY_ICON_CLASS[alert.category]]}`}
              >
                <Icon size={20} />
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
                    {alert.title}
                  </p>
                  <span
                    className={`${styles.pill} ${styles[CATEGORY_PILL_CLASS[alert.category]]}`}
                  >
                    {alert.category === "Notice" ? "Notice" : alert.category}
                  </span>
                </div>

                <p className={styles.alertDescription}>{alert.description}</p>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Building2 size={14} />
                    {alert.location}
                  </span>
                  <span className={styles.metaItem}>
                    <Clock size={14} />
                    {alert.timestamp}
                  </span>
                  <span className={styles.metaItem}>
                    <Users size={14} />
                    {alert.recipientCount.toLocaleString()} recipients
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
