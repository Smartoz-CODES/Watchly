import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Check,
  XCircle,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { useAlerts } from "../hooks/use-alerts";
import ErrorState from "../components/ErrorState/ErrorState";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import EmptyState from "../components/EmptyState/EmptyState";
import type { Alert } from "../types/alert";
import styles from "./AlertFeedPage.module.css";

type DisplayableStatus = "Verified" | "Resolved" | "Not Verified";
type FilterTab = "All" | DisplayableStatus;

const FILTER_TABS: FilterTab[] = [
  "All",
  "Verified",
  "Resolved",
  "Not Verified",
];

const STATUS_ICON: Record<DisplayableStatus, typeof ShieldCheck> = {
  Verified: ShieldCheck,
  Resolved: Check,
  "Not Verified": XCircle,
};

const STATUS_ICON_CLASS: Record<DisplayableStatus, string> = {
  Verified: "iconWrapGreen",
  Resolved: "iconWrapGray",
  "Not Verified": "iconWrapRed",
};

const STATUS_PILL_CLASS: Record<DisplayableStatus, string> = {
  Verified: "pillGreen",
  Resolved: "pillGray",
  "Not Verified": "pillRed",
};

const CHANNEL_ICON: Record<"WebPush" | "InApp", typeof Smartphone> = {
  WebPush: Smartphone,
  InApp: MessageSquare,
};

const CHANNEL_LABEL: Record<"WebPush" | "InApp", string> = {
  WebPush: "Web Push",
  InApp: "In App",
};

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const isDisplayableStatus = (
  status: Alert["incident_status"],
): status is DisplayableStatus =>
  status === "Verified" || status === "Resolved" || status === "Not Verified";

const AlertFeedPage = () => {
  const navigate = useNavigate();
  const { alerts, loading, error, fetchAlerts, markAsRead } = useAlerts();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // SMS alerts arrive outside the app entirely — only In App / Web Push
  // are shown here.
  const displayableAlerts = alerts.filter(
    (a) => a.alert_type !== "SMS" && isDisplayableStatus(a.incident_status),
  );

  const filteredAlerts =
    activeTab === "All"
      ? displayableAlerts
      : displayableAlerts.filter((a) => a.incident_status === activeTab);

  const handleAlertTap = async (alert: Alert) => {
    if (!alert.is_read) {
      try {
        await markAsRead(alert.alert_id);
      } catch {
        // markAsRead already surfaces its own error via the hook's `error`
        // state — navigation still proceeds so the user isn't blocked.
      }
    }
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

      {loading && alerts.length === 0 && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchAlerts} />
      )}

      {!loading && !error && filteredAlerts.length === 0 && (
        <EmptyState icon={ShieldCheck} title="No alerts yet." />
      )}

      {!loading && !error && filteredAlerts.length > 0 && (
        <div className={styles.alertList}>
          {filteredAlerts.map((alert) => {
            const status = alert.incident_status as DisplayableStatus;
            const channel = alert.alert_type as "WebPush" | "InApp";
            const StatusIcon = STATUS_ICON[status];
            const ChannelIcon = CHANNEL_ICON[channel];

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
                  className={`${styles.iconWrap} ${styles[STATUS_ICON_CLASS[status]]}`}
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
                      {alert.incident_category} — {alert.community_name}
                    </p>
                    <span
                      className={`${styles.pill} ${styles[STATUS_PILL_CLASS[status]]}`}
                    >
                      {alert.incident_status}
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <ChannelIcon size={14} />
                      {CHANNEL_LABEL[channel]}
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
      )}
    </div>
  );
};

export default AlertFeedPage;
