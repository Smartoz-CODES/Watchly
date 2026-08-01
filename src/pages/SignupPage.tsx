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

const SignupPage = () => {
  const { signUp, verifyOtp, resendOtp, pendingVerification } = useAuth();
  const { joinCommunity } = useCommunities();
  const { refreshCommunities } = useCommunity();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // A login attempt on an unverified account stages a pendingVerification
  // and routes here — land straight on the OTP step instead of the name/
  // email form. Computed once, in the initializer, rather than via an
  // effect: this is derived from data that already exists at mount, not
  // an external event to synchronize with.
  const [step, setStep] = useState<1 | 2>(() =>
    pendingVerification ? 2 : 1,
  );
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

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // 60s when a fresh signup just issued an OTP; 0 (resend available
  // immediately) when arriving here via a login redirect, since we
  // don't know how long ago that account's OTP was actually sent.
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
      // TODO: joinCommunity expects a community_id, not a slug — there's
      // no slug-to-id lookup wired up anywhere yet. Passing the slug
      // through as-is for now; this needs a real resolution step (or the
      // join Edge Function needs to accept a slug directly) before this
      // can ever actually succeed.
      await joinCommunity(slug);
      // refreshCommunities is always correct to call here regardless of
      // the slug issue above — it just re-fetches the real, current
      // list. Deliberately NOT calling switchCommunity here though:
      // that needs a real community_id, and all that exists at this
      // point is the slug — passing it through would silently leave
      // activeCommunity null rather than actually switching to anything.
      // Add switchCommunity(realId) here once the slug-to-id gap above
      // is resolved.
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
      showToast(
        VALIDATION_TOASTS.missingFields.title,
        VALIDATION_TOASTS.missingFields.description,
        "error",
      );
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast(
        VALIDATION_TOASTS.invalidEmail.title,
        VALIDATION_TOASTS.invalidEmail.description,
        "error",
      );
      return;
    }
    if (!/^(0|\+234)\d{10}$/.test(phone)) {
      showToast(
        VALIDATION_TOASTS.invalidPhone.title,
        VALIDATION_TOASTS.invalidPhone.description,
        "error",
      );
      return;
    }
    if (password.length < 8) {
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
            <div className={styles.inputWrapper}>
              <input
                id="name"
                type="text"
                placeholder="Input your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="Input your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone number</label>
            <div className={styles.inputWrapper}>
              <input
                id="phone"
                type="text"
                placeholder="Input your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className={styles.helperText}>
              You will receive SMS alerts when incidents are verified in your
              community.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className={styles.helperText}>
              Your password should be at least 8 characters, mix of uppercase
              letters, lowercase letters, numbers, and special characters (e.g.,
              @, #, $, %).
            </p>
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
          {!verified && (
            <>
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
            </>
          )}

          {verified && !joinedCommunityName && (
            <div className={styles.fullPageStep}>
              <div className={styles.verifiedIconWrap}>
                <div className={styles.verifiedIcon}>
                  <Check className={styles.verifiedIconGlyph} color="#fff" />
                </div>
              </div>

              <h2 className={styles.verifiedTitle}>Phone verified</h2>
              <p className={styles.verifiedBody}>
                Your number {maskPhone(normalizePhoneE164(phone))} is confirmed.
                SMS alerts are now active.
              </p>
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