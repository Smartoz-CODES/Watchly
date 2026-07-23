import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import OTPInput from "../components/OTPInput/OTPInput";
import { useToast } from "../hooks/use-toast";

import styles from "../styles/PasswordRecoveryPage.module.css";

const PasswordRecoveryPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading] = useState(false);

  const handleSendResetLink = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      showToast("Email is required", "error");
      return;
    }

    setStep(2);
  };

  const handleResetPassword = () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }

    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    showToast("Password updated. Please log in.", "success");

    navigate("/login");
  };

  return (
    <>
      {step === 1 && (
        <form className={styles.form} onSubmit={handleSendResetLink}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Your Password</h1>

            <p className={styles.subtitle}>
              Enter your email to receive a reset link.
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
                required
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
      )}
      {step === 2 && (
        <div className={styles.form}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Your Password</h1>

            <p className={styles.subtitle}>
              Reset password to gain access to your profile.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label>Enter the verification code</label>

            <OTPInput
              length={6}
              value={otp}
              onChange={(code) => {
                setOtp(code);
                setOtpError(null);
              }}
              error={otpError}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">New Password</label>

            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.icon} />

              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.icon} />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleResetPassword}
          >
            Reset Password
          </button>

          <p className={styles.footerText}>
            <Link to="/support">Experiencing Issues? Contact Support</Link>
          </p>
        </div>
      )}
    </>
  );
};

export default PasswordRecoveryPage;
