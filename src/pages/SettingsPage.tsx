import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCommunity } from "../hooks/use-community";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../lib/supabase";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import styles from "./SettingsPage.module.css";

interface AccountNotificationPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
}

interface CommunityNotificationPrefs {
  notify_verified_only: boolean;
  notify_new_reports: boolean;
  notify_admin_safety: boolean;
}

const DEFAULT_ACCOUNT_PREFS: AccountNotificationPrefs = {
  email_notifications: true,
  push_notifications: true,
};

const DEFAULT_COMMUNITY_PREFS: CommunityNotificationPrefs = {
  notify_verified_only: true,
  notify_new_reports: true,
  notify_admin_safety: true,
};

// Account-wide: about *how* you're reached, not tied to any one
// community — a personal habit, same everywhere.
const ACCOUNT_NOTIFICATION_ROWS: {
  key: keyof AccountNotificationPrefs;
  label: string;
  description: string;
}[] = [
  {
    key: "email_notifications",
    label: "Email notifications",
    description:
      "Receive a daily digest and important updates in your inbox. Applies to your whole account.",
  },
  {
    key: "push_notifications",
    label: "Push notifications",
    description:
      "Get instant alerts on your device when something needs your attention. Applies to your whole account.",
  },
];

// Per-community: about *what* you want to hear about, which genuinely
// varies by community — same reasoning the TRD already applies to SMS
// opt-out. Label text embeds the community name directly so scope is
// never ambiguous, matching the LLD's own SMSToggle convention.
const COMMUNITY_NOTIFICATION_ROWS: {
  key: keyof CommunityNotificationPrefs;
  label: (communityName: string) => string;
  description: string;
}[] = [
  {
    key: "notify_verified_only",
    label: (name) => `Only notify me for Verified incidents in ${name}`,
    description:
      "Get updates only when a report has been verified by the community.",
  },
  {
    key: "notify_new_reports",
    label: (name) => `Alert me for all new reports in ${name}`,
    description:
      "Receive an alert whenever a new incident is reported in this community.",
  },
  {
    key: "notify_admin_safety",
    label: (name) => `Receive Admin safety alerts for ${name}`,
    description:
      "Stay informed about urgent safety updates from this community's administrators.",
  },
];

const SettingsPage = () => {
  const { user, deleteAccount } = useAuth();
  const {
    activeCommunity,
    userCommunities,
    memberships,
    loading: communityLoading,
  } = useCommunity();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [accountPrefs, setAccountPrefs] = useState<AccountNotificationPrefs>(
    DEFAULT_ACCOUNT_PREFS,
  );
  const [communityPrefs, setCommunityPrefs] = useState<
    Record<string, CommunityNotificationPrefs>
  >({});
  // The three toggles above are still fully UI-only, no confirmed
  // backend field for any of them. SMS is different — sms_alerts_enabled
  // is a real, already-fetched field on CommunityMembership, so this
  // starts from the real value per community rather than a fake default.
  // Still only overrides locally on toggle, since there's no real update
  // call wired up yet either — but at least it starts honest.
  const [smsOverrides, setSmsOverrides] = useState<Record<string, boolean>>({});

  const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleToggleAccountPref = (key: keyof AccountNotificationPrefs) => {
    // UI-only for now — no confirmed backend field to persist to yet.
    setAccountPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleCommunityPref = (
    communityId: string,
    key: keyof CommunityNotificationPrefs,
  ) => {
    // UI-only for now — same situation as the account-wide toggles.
    setCommunityPrefs((prev) => {
      const current = prev[communityId] ?? DEFAULT_COMMUNITY_PREFS;
      return { ...prev, [communityId]: { ...current, [key]: !current[key] } };
    });
  };

  const handleToggleSms = (communityId: string, currentValue: boolean) => {
    // TODO Day 2: this needs a real update call against
    // community_memberships once one exists — currently only flips the
    // local override, same limitation as everywhere else waiting on a
    // backend write endpoint.
    setSmsOverrides((prev) => ({ ...prev, [communityId]: !currentValue }));
  };

  const handleNameBlur = async () => {
    if (!user || displayName.trim() === user.name) return;

    const { error } = await supabase
      .from("users")
      .update({ name: displayName.trim() })
      .eq("user_id", user.user_id);

    if (error) {
      showToast("Failed to update name", error.message, "error");
      setDisplayName(user.name); // revert on failure
      return;
    }

    showToast("Name updated", "Your display name has been saved.", "success");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    // TODO: no documented Storage bucket or upload path exists yet for
    // profile photos anywhere in the TRD (incident evidence has one,
    // profile photos don't). Not wiring a real upload until backend
    // confirms the bucket name and path convention.
    showToast(
      "Photo upload not available yet",
      "This needs a storage bucket confirmed with backend first.",
      "error",
    );
  };

  const handleLeaveCommunity = async () => {
    // TODO: no leaveCommunity method exists in useCommunities or
    // CommunityContext per the LLD — this needs a new hook method and
    // likely a new Edge Function before it can actually do anything.
    setLeaveDialogOpen(false);
    showToast(
      "Leave community not available yet",
      "This feature needs a backend endpoint that doesn't exist yet.",
      "error",
    );
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
    } catch {
      // deleteAccount() already fires its own error toast
    } finally {
      setIsDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Settings</h1>
      <p className={styles.pageSubtitle}>
        Manage your account, notification preferences, and community experience.
      </p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Account Settings</h2>

        <div className={styles.photoRow}>
          <div className={styles.photoWrapper}>
            {user?.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt=""
                className={styles.photo}
              />
            ) : (
              <div className={styles.photoFallback}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <button
              type="button"
              className={styles.photoEditButton}
              aria-label="Change profile photo"
              onClick={handlePhotoClick}
            >
              <Pencil size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className={styles.hiddenFileInput}
              onChange={handlePhotoSelected}
            />
          </div>
          <div>
            <p className={styles.photoLabel}>Profile photo</p>
            <p className={styles.photoHint}>JPG or PNG. Maximum size 2MB.</p>
          </div>
        </div>

        <label className={styles.fieldLabel} htmlFor="display-name">
          Display name
        </label>
        <input
          id="display-name"
          type="text"
          className={styles.fieldInput}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={handleNameBlur}
        />

        <label className={styles.fieldLabel} htmlFor="email-address">
          Email address
        </label>
        <input
          id="email-address"
          type="email"
          className={styles.fieldInputDisabled}
          value={user?.email ?? ""}
          disabled
          readOnly
        />

        <label className={styles.fieldLabel} htmlFor="phone-number">
          Phone number
        </label>
        <input
          id="phone-number"
          type="tel"
          className={styles.fieldInputDisabled}
          value={user?.phone_number ?? ""}
          disabled
          readOnly
        />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Delivery Method</h2>
        <p className={styles.sectionHint}>
          How you're reached — applies the same way across every community.
        </p>

        {ACCOUNT_NOTIFICATION_ROWS.map(({ key, label, description }) => (
          <div key={key} className={styles.toggleRow}>
            <div>
              <p className={styles.toggleLabel}>{label}</p>
              <p className={styles.toggleDescription}>{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accountPrefs[key]}
              aria-label={label}
              className={accountPrefs[key] ? styles.switchOn : styles.switchOff}
              onClick={() => handleToggleAccountPref(key)}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        ))}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Notifications by Community</h2>
        <p className={styles.sectionHint}>
          What you're notified about — set separately for each community you've
          joined.
        </p>

        {communityLoading && (
          <p className={styles.emptyCommunitiesNote}>
            Loading your communities…
          </p>
        )}

        {!communityLoading && userCommunities.length === 0 && (
          <p className={styles.emptyCommunitiesNote}>
            Join a community to set its notification preferences.
          </p>
        )}

        {userCommunities.map((community) => {
          const prefs =
            communityPrefs[community.community_id] ?? DEFAULT_COMMUNITY_PREFS;
          const membership = memberships.find(
            (m) => m.community_id === community.community_id,
          );
          const smsEnabled =
            smsOverrides[community.community_id] ??
            membership?.sms_alerts_enabled ??
            true;

          return (
            <div key={community.community_id} className={styles.communityGroup}>
              <p className={styles.communityGroupTitle}>{community.name}</p>

              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>
                    SMS Alerts for {community.name}
                  </p>
                  <p className={styles.toggleDescription}>
                    Receive a text message outside the app when an incident in
                    this community is verified.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={smsEnabled}
                  aria-label={`SMS Alerts for ${community.name}`}
                  className={smsEnabled ? styles.switchOn : styles.switchOff}
                  onClick={() =>
                    handleToggleSms(community.community_id, smsEnabled)
                  }
                >
                  <span className={styles.switchThumb} />
                </button>
              </div>

              {COMMUNITY_NOTIFICATION_ROWS.map(
                ({ key, label, description }) => (
                  <div key={key} className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleLabel}>
                        {label(community.name)}
                      </p>
                      <p className={styles.toggleDescription}>{description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[key]}
                      aria-label={label(community.name)}
                      className={
                        prefs[key] ? styles.switchOn : styles.switchOff
                      }
                      onClick={() =>
                        handleToggleCommunityPref(community.community_id, key)
                      }
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  </div>
                ),
              )}
            </div>
          );
        })}
      </section>

      <section className={styles.dangerCard}>
        <h2 className={styles.dangerTitle}>Danger zone</h2>

        <div className={styles.dangerRow}>
          <div>
            <p className={styles.dangerLabel}>Leave Community</p>
            <p className={styles.dangerDescription}>
              {activeCommunity
                ? `Leave ${activeCommunity.name} and stop receiving its updates.`
                : "No active community to leave."}
            </p>
          </div>
          <button
            type="button"
            className={styles.leaveButton}
            disabled={!activeCommunity}
            onClick={() => setLeaveDialogOpen(true)}
          >
            Leave
          </button>
        </div>

        <div className={styles.dangerRow}>
          <div>
            <p className={styles.dangerLabel}>Delete account</p>
            <p className={styles.dangerDescription}>
              Permanently remove your account and all associated data.
            </p>
          </div>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete account
          </button>
        </div>
      </section>

      {isLeaveDialogOpen && (
        <ConfirmDialog
          title="Leave Community"
          message={`Are you sure you want to leave ${activeCommunity?.name ?? "this community"}? You'll stop receiving its incident reports and alerts.`}
          confirmLabel="Leave"
          onConfirm={handleLeaveCommunity}
          onCancel={() => setLeaveDialogOpen(false)}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Delete Account"
          message="This will permanently delete your account and anonymize your data. This cannot be undone."
          confirmLabel={isDeletingAccount ? "Deleting…" : "Delete"}
          destructive
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingsPage;
