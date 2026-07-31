import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Info, Mail, X } from "lucide-react";

import { useToast } from "../hooks/use-toast";
import { VALIDATION_TOASTS } from "../lib/toast-messages";

import styles from "./PasswordRecoveryPage.module.css";

const PasswordRecoveryPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // No backend endpoint yet marks a "reset" landing (Supabase used to
  // flip this via its PASSWORD_RECOVERY auth event on email-link
  // arrival). Stays "request" until that mechanism has a replacement;
  // see the Send Reset Link / Set New Password handlers below.
  const [mode] = useState<"request" | "reset">("request");
  const [bannerVisible, setBannerVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const handleSendResetLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      showToast(
        VALIDATION_TOASTS.emailRequired.title,
        VALIDATION_TOASTS.emailRequired.description,
        "error",
      );
      return;
    }

    try {
      setLoading(true);
      // The auth backend doesn't expose password-reset endpoints yet.
      // Surface that honestly instead of pretending an email was sent.
      showToast(
        "Not available yet",
        "Password reset ships with the next backend update. Contact your community admin if you are locked out.",
        "info",
      );
    } catch {
      showToast(
        VALIDATION_TOASTS.sendLinkFailed.title,
        VALIDATION_TOASTS.sendLinkFailed.description,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError("Password is required");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      hasError = true;
    } else {
      setNewPasswordError(null);
    }

    if (!confirmPassword || confirmPassword !== newPassword) {
      setConfirmPasswordError("Password must match");
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    try {
      setLoading(true);
      showToast(
        "Not available yet",
        "Password reset ships with the next backend update.",
        "info",
      );
      navigate("/login");
    } catch {
      showToast(
        VALIDATION_TOASTS.updateFailed.title,
        VALIDATION_TOASTS.updateFailed.description,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {mode === "request" && (
        <>
          {bannerVisible && (
            <div className={styles.banner}>
              <Info size={20} className={styles.bannerIcon} />
              <div className={styles.bannerText}>
                <p className={styles.bannerTitle}>Check your email</p>
                <p className={styles.bannerBody}>
                  Password reset instructions sent to your email.
                </p>
              </div>
              <button
                type="button"
                className={styles.bannerClose}
                onClick={() => setBannerVisible(false)}
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSendResetLink}>
            <div className={styles.header}>
              <h1 className={styles.title}>Reset Your Password</h1>
              <p className={styles.subtitle}>
                Enter your email to receive a reset link
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.icon} />
                <input
                  id="email"
                  type="email"
                  placeholder="Input your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className={styles.footerText}>
              Go back to login? <Link to="/login">Login Here</Link>
            </p>
          </form>
        </>
      )}

      {mode === "reset" && (
        <div className={styles.form}>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => navigate("/login")}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Reset Your Password</h1>
            <p className={styles.subtitle}>
              Reset password to gain access to your profile.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">New password</label>
            <div
              className={`${styles.inputWrapper} ${newPasswordError ? styles.inputError : ""}`}
            >
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError(null);
                }}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {newPasswordError ? (
              <p className={styles.fieldError}>{newPasswordError}</p>
            ) : (
              <p className={styles.helperText}>
                Your password should be at least 8 characters, mix of uppercase
                letters, lowercase letters, numbers, and special characters
                (e.g., @, #, $, %).
              </p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <div
              className={`${styles.inputWrapper} ${confirmPasswordError ? styles.inputError : ""}`}
            >
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(null);
                }}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className={styles.fieldError}>{confirmPasswordError}</p>
            )}
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className={styles.footerText}>
            {/* Was a dead /support link — no support page or route exists
                anywhere in this app. Fixed to a working mailto: rather than
                inventing a whole new page to solve one broken link. Worth
                a real support page later if this becomes a common need. */}
            <a href="mailto:support@watchly.app">
              Experiencing Issues? Contact Support
            </a>
          </p>
        </div>
      )}
    </>
  );
};

export default PasswordRecoveryPage;
