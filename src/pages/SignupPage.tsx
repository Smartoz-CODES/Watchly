import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Handshake,
  Radio,
} from "lucide-react";

import AuthLogo from "../components/AuthLogo/AuthLogo";
import OTPInput from "../components/OTPInput/OTPInput";
import { useAuth } from "../hooks/use-auth";
import { useCommunities } from "../hooks/use-communities";
import { useCommunity } from "../hooks/use-community";
import { useToast } from "../hooks/use-toast";
import { normalizePhoneE164 } from "../lib/phone";
import { AUTH_TOASTS, VALIDATION_TOASTS } from "../lib/toast-messages";

import styles from "./SignupPage.module.css";

const maskPhone = (e164: string): string => {
  const digits = e164.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `+234 *** *** ${last4}`;
};

const prettifySlugAsName = (slug: string): string =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface SignupFieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const SignupPage = () => {
  const { signUp, verifyOtp, resendOtp, pendingVerification } = useAuth();
  const { joinCommunity } = useCommunities();
  const { refreshCommunities } = useCommunity();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(() => (pendingVerification ? 2 : 1));
  const [verified, setVerified] = useState(false);
  const [joinedCommunityName, setJoinedCommunityName] = useState<string | null>(
    null,
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    pendingVerification ? 0 : 60,
  );

  const handlePostVerification = useCallback(async () => {
    const slug = new URLSearchParams(window.location.search).get("community");

    if (!slug) {
      navigate("/communities");
      return;
    }

    try {
      await joinCommunity(slug);
      await refreshCommunities();
      setJoinedCommunityName(prettifySlugAsName(slug));
    } catch {
      navigate("/communities");
    }
  }, [navigate, joinCommunity, refreshCommunities]);

  useEffect(() => {
    if (step !== 2 || countdown === 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  useEffect(() => {
    if (!verified) return;

    const timer = setTimeout(() => {
      handlePostVerification();
    }, 2000);
    return () => clearTimeout(timer);
  }, [verified, handlePostVerification]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setFieldErrors({
        name: !name ? "Full name is required" : undefined,
        email: !email ? "Email is required" : undefined,
        phone: !phone ? "Phone number required" : undefined,
        password: !password ? "Password is required" : undefined,
      });
      showToast(
        VALIDATION_TOASTS.missingFields.title,
        VALIDATION_TOASTS.missingFields.description,
        "error",
      );
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      showToast(
        VALIDATION_TOASTS.invalidEmail.title,
        VALIDATION_TOASTS.invalidEmail.description,
        "error",
      );
      return;
    }
    if (!/^(0|\+234)\d{10}$/.test(phone)) {
      setFieldErrors((prev) => ({ ...prev, phone: "Phone number required" }));
      showToast(
        VALIDATION_TOASTS.invalidPhone.title,
        VALIDATION_TOASTS.invalidPhone.description,
        "error",
      );
      return;
    }
    if (password.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
      showToast(
        VALIDATION_TOASTS.passwordTooShort.title,
        VALIDATION_TOASTS.passwordTooShort.description,
        "error",
      );
      return;
    }
    if (!agreePolicy) {
      showToast(
        VALIDATION_TOASTS.privacyPolicyRequired.title,
        VALIDATION_TOASTS.privacyPolicyRequired.description,
        "error",
      );
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      const normalizedPhone = normalizePhoneE164(phone);
      await signUp(name, email, normalizedPhone, password);
      setStep(2);
      setCountdown(60);
    } catch {
      // signUp already throws and shows its own toast
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const normalizedPhone = normalizePhoneE164(phone);
      await verifyOtp(normalizedPhone, otp);
      setVerified(true);
    } catch {
      setOtpError(AUTH_TOASTS.incorrectCode.description);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resending || countdown > 0) return;

    try {
      setResending(true);
      await resendOtp();
      setCountdown(60);
      const displayPhone =
        pendingVerification?.phone || normalizePhoneE164(phone);
      const codeSentMessage = AUTH_TOASTS.codeSent(maskPhone(displayPhone));
      showToast(codeSentMessage.title, codeSentMessage.description, "info");
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? (err as { code: string }).code
          : "";
      if (code === "OTP_RESEND_COOLDOWN" || code === "RATE_LIMIT_EXCEEDED") {
        showToast(
          AUTH_TOASTS.tooManyOtpRequests.title,
          AUTH_TOASTS.tooManyOtpRequests.description,
          "error",
        );
      } else {
        showToast(
          VALIDATION_TOASTS.resendFailed.title,
          VALIDATION_TOASTS.resendFailed.description,
          "error",
        );
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {step === 1 && (
        <form className={styles.form} onSubmit={handleSignup}>
          <AuthLogo />

          <div className={styles.header}>
            <h1 className={styles.title}>Let's get started</h1>
            <p className={styles.subtitle}>
              Create your account to start reporting, corroborating, and staying
              informed.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <div
              className={`${styles.inputWrapper} ${
                fieldErrors.name ? styles.inputWrapperError : ""
              }`}
            >
              <input
                id="name"
                type="text"
                placeholder="Input your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
            </div>
            {fieldErrors.name && (
              <p className={styles.fieldError}>{fieldErrors.name}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div
              className={`${styles.inputWrapper} ${
                fieldErrors.email ? styles.inputWrapperError : ""
              }`}
            >
              <input
                id="email"
                type="email"
                placeholder="Input your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
            </div>
            {fieldErrors.email && (
              <p className={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone number</label>
            <div
              className={`${styles.inputWrapper} ${
                fieldErrors.phone ? styles.inputWrapperError : ""
              }`}
            >
              <input
                id="phone"
                type="text"
                placeholder="Input your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
            </div>
            {fieldErrors.phone ? (
              <p className={styles.fieldError}>{fieldErrors.phone}</p>
            ) : (
              <p className={styles.helperText}>
                You will receive SMS alerts when incidents are verified in your
                community.
              </p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div
              className={`${styles.inputWrapper} ${
                fieldErrors.password ? styles.inputWrapperError : ""
              }`}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className={styles.fieldError}>{fieldErrors.password}</p>
            ) : (
              <p className={styles.helperText}>
                Your password should be at least 8 characters, mix of uppercase
                letters, lowercase letters, numbers, and special characters
                (e.g., @, #, $, %).
              </p>
            )}
          </div>

          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={agreePolicy}
              onChange={(e) => setAgreePolicy(e.target.checked)}
            />
            <span>
              Agree with{" "}
              <span className={styles.policyLink}>Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Get started"}
          </button>

          <p className={styles.footerText}>
            Have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <div className={styles.form}>
          {!joinedCommunityName && (
            <div className={verified ? styles.otpFormBlurred : undefined}>
              <button
                type="button"
                className={styles.backLink}
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={24} /> Back
              </button>

              <div className={styles.header}>
                <h1 className={styles.title}>Verification code</h1>
                <p className={styles.subtitle}>
                  Check your SMS messages for a 6-digit verification code
                </p>
              </div>

              {pendingVerification?.demoOtp && (
                <div className={styles.demoOtpBanner}>
                  <p className={styles.demoOtpLabel}>Demo mode — your code:</p>
                  <p className={styles.demoOtpValue}>
                    {pendingVerification.demoOtp}
                  </p>
                </div>
              )}

              <OTPInput
                length={6}
                value={otp}
                onChange={(code) => {
                  setOtp(code);
                  setOtpError(null);
                }}
                error={otpError}
              />

              <div className={styles.resendContainer}>
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  className={styles.resendButton}
                  disabled={countdown > 0 || resending}
                  onClick={handleResendCode}
                >
                  Resend Code
                </button>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}

          {verified && !joinedCommunityName && (
            <div className={styles.verifiedOverlay}>
              <div className={styles.verifiedModal}>
                <div className={styles.fullPageStep}>
                  <div className={styles.verifiedIconWrap}>
                    <div className={styles.verifiedIcon}>
                      <Check
                        className={styles.verifiedIconGlyph}
                        color="#fff"
                      />
                    </div>
                  </div>

                  <h2 className={styles.verifiedTitle}>Phone verified</h2>
                  <p className={styles.verifiedBody}>
                    Your number {maskPhone(normalizePhoneE164(phone))} is
                    confirmed. SMS alerts are now active.
                  </p>
                </div>
              </div>
            </div>
          )}

          {joinedCommunityName && (
            <div className={styles.fullPageStep}>
              <AuthLogo />

              <div className={styles.verifiedIconWrap}>
                <div className={styles.verifiedIcon}>
                  <Check className={styles.verifiedIconGlyph} color="#fff" />
                </div>
              </div>

              <h2 className={styles.verifiedTitle}>
                You have joined {joinedCommunityName}!
              </h2>
              <p className={styles.verifiedBody}>
                You reviewed the community details and chose to join. Welcome to{" "}
                {joinedCommunityName}.
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureRow}>
                  <span className={styles.featureIconWrap}>
                    <Bell size={18} />
                  </span>
                  <div>
                    <p className={styles.featureTitle}>
                      You will receive SMS alerts
                    </p>
                    <p className={styles.featureBody}>
                      When an incident in {joinedCommunityName} is verified by
                      your Admin, you get an SMS even if the app is closed.
                    </p>
                  </div>
                </div>

                <div className={styles.featureRow}>
                  <span className={styles.featureIconWrap}>
                    <Radio size={18} />
                  </span>
                  <div>
                    <p className={styles.featureTitle}>
                      Browse the incident feed
                    </p>
                    <p className={styles.featureBody}>
                      See what has been reported, corroborated, and verified in
                      your community.
                    </p>
                  </div>
                </div>

                <div className={styles.featureRow}>
                  <span className={styles.featureIconWrap}>
                    <Handshake size={18} />
                  </span>
                  <div>
                    <p className={styles.featureTitle}>
                      Corroborate incidents you know about
                    </p>
                    <p className={styles.featureBody}>
                      If you witness something, confirm it on Watchly. Your
                      input helps your Admin verify faster.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate("/home")}
              >
                Go to my community feed
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SignupPage;
