import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Calendar,
  Pencil,
  Lock,
  ShieldCheck,
  Bell,
  Shield,
  LogOut,
  Users,
  CheckCircle2,
  History,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCommunity } from "../hooks/use-community";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../lib/supabase";
import styles from "./ProfilePage.module.css";

// ---------------------------------------------------------------------
// "Location" isn't a field on the User type anywhere in the TRD — mocked
// here per instruction, backend conversation being handled separately.
// The four Activity Summary numbers are the same unresolved aggregate
// gap already flagged on MyReportPage (no per-user report stats endpoint
// exists yet) — not re-drafting that backend note here, same fix covers
// both pages once it exists.
// ---------------------------------------------------------------------

const MOCK_LOCATION = "Lagos, Nigeria";

const MOCK_ACTIVITY = {
  totalSubmitted: 20,
  underReview: 8,
  verified: 10,
  unverified: 2,
};

const MIN_PASSWORD_LENGTH = 8; // TRD only says "meeting minimum requirements" — guessing 8, confirm with backend/security

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { activeCommunity, userCommunities } = useCommunity();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      // signOut() already fires its own error toast
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEnable2FA = () => {
    showToast(
      "Two-factor authentication not available yet",
      "This isn't in scope for the current build.",
      "error",
    );
  };

  const handlePrivacySettings = () => {
    showToast(
      "Privacy Settings not available yet",
      "This page hasn't been built yet.",
      "error",
    );
  };

  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className={styles.container}>
      <section className={styles.headerCard}>
        <div className={styles.avatarWrapper}>
          {user?.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt=""
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <div>
          <p className={styles.headerName}>
            {user?.name}
            {user?.phone_verified && (
              <span className={styles.verifiedPill}>
                <BadgeCheck size={14} />
                Verified
              </span>
            )}
          </p>
          <p className={styles.headerContact}>{user?.email}</p>
          <p className={styles.headerContact}>{user?.phone_number}</p>
          <p className={styles.memberSincePill}>
            <Calendar size={14} />
            Member since {memberSince}
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          <button
            type="button"
            className={styles.editLink}
            onClick={() => navigate("/settings")}
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Full Name</span>
          <span className={styles.infoValue}>{user?.name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email Address</span>
          <span className={styles.infoValue}>{user?.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Phone Number</span>
          <span className={styles.infoValue}>
            {user?.phone_number}
            {user?.phone_verified && (
              <span className={styles.smallVerifiedPill}>
                <BadgeCheck size={12} />
                Verified
              </span>
            )}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Member Since</span>
          <span className={styles.infoValue}>{memberSince}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Location</span>
          <span className={styles.infoValue}>{MOCK_LOCATION}</span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Security</h2>

        <div className={styles.securityRow}>
          <div className={styles.securityIconLabel}>
            <span className={styles.securityIcon}>
              <Lock size={18} />
            </span>
            <div>
              <p className={styles.securityLabel}>Password</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.securityAction}
            onClick={() => setChangePasswordOpen(true)}
          >
            Change password
          </button>
        </div>

        <div className={styles.securityRow}>
          <div className={styles.securityIconLabel}>
            <span className={styles.securityIcon}>
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className={styles.securityLabel}>Two-Factor Authentication</p>
              <p className={styles.securityDescription}>
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.securityAction}
            onClick={handleEnable2FA}
          >
            Enable
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h2 className={styles.cardTitle}>My Communities</h2>
          <button
            type="button"
            className={styles.editLink}
            onClick={() => navigate("/communities")}
          >
            View all
          </button>
        </div>

        {userCommunities.map((community) => {
          const isActive =
            community.community_id === activeCommunity?.community_id;
          return (
            <div key={community.community_id} className={styles.communityRow}>
              <div>
                <p className={styles.communityName}>
                  {community.name}
                  {isActive && (
                    <span className={styles.activePill}>Active</span>
                  )}
                </p>
                <p className={styles.communityMeta}>
                  <Users size={13} />
                  {community.member_count} members . {community.state}
                </p>
              </div>
              {isActive && (
                <button
                  type="button"
                  className={styles.viewButton}
                  onClick={() => navigate("/home")}
                >
                  View
                </button>
              )}
            </div>
          );
        })}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Activity Summary</h2>
        <div className={styles.activityGrid}>
          <div className={styles.activityTile}>
            <span className={styles.activityIconTeal}>
              <CheckCircle2 size={16} />
            </span>
            <p className={styles.activityValue}>
              {MOCK_ACTIVITY.totalSubmitted}
            </p>
            <p className={styles.activityLabel}>Total Submitted</p>
          </div>
          <div className={styles.activityTile}>
            <span className={styles.activityIconUnderReview}>
              <History size={16} />
            </span>
            <p className={styles.activityValue}>{MOCK_ACTIVITY.underReview}</p>
            <p className={styles.activityLabel}>Under Review</p>
          </div>
          <div className={styles.activityTile}>
            <span className={styles.activityIconGreen}>
              <CheckCircle2 size={16} />
            </span>
            <p className={styles.activityValue}>{MOCK_ACTIVITY.verified}</p>
            <p className={styles.activityLabel}>Verified</p>
          </div>
          <div className={styles.activityTile}>
            <span className={styles.activityIconRed}>
              <AlertCircle size={16} />
            </span>
            <p className={styles.activityValue}>{MOCK_ACTIVITY.unverified}</p>
            <p className={styles.activityLabel}>Unverified</p>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <button
          type="button"
          className={styles.shortcutRow}
          onClick={() => navigate("/settings")}
        >
          <span className={styles.shortcutIconLabel}>
            <Bell size={18} />
            Notification Settings
          </span>
        </button>
        <button
          type="button"
          className={styles.shortcutRow}
          onClick={handlePrivacySettings}
        >
          <span className={styles.shortcutIconLabel}>
            <Shield size={18} />
            Privacy Settings
          </span>
        </button>
        <button
          type="button"
          className={styles.shortcutRowDestructive}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <span className={styles.shortcutIconLabel}>
            <LogOut size={18} />
            {isSigningOut ? "Signing out…" : "Sign Out"}
          </span>
        </button>
      </section>

      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      )}
    </div>
  );
};

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // Real Supabase Auth call — no custom backend endpoint needed for
      // this one, updateUser() is native to supabase-js.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      showToast(
        "Password updated",
        "Your password has been changed.",
        "success",
      );
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      showToast("Failed to update password", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Change Password</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <label className={styles.fieldLabel} htmlFor="new-password">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          className={styles.fieldInput}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="confirm-password">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          className={styles.fieldInput}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className={styles.fieldError}>{error}</p>}

        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
