import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Eye, EyeOff, Lock } from "lucide-react";

import OTPInput from "../components/OTPInput/OTPInput";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../lib/supabase";
import { normalizePhoneE164 } from "../lib/phone";
import { AUTH_TOASTS, VALIDATION_TOASTS } from "../lib/toast-messages";

import styles from "./SignupPage.module.css";

const maskPhone = (e164: string): string => {
  const digits = e164.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `+234 *** *** ${last4}`;
};

const SignupPage = () => {
  const { signUp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [verified, setVerified] = useState(false);

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
  const [countdown, setCountdown] = useState(60);

  const goToNextStep = () => {
    const slug = new URLSearchParams(window.location.search).get("community");
    // TODO Day 2: call useCommunities().joinCommunity(slug) here before navigating
    // TODO Day 2: call useCommunity().refreshCommunities() after joining
    navigate(slug ? "/home" : "/communities");
  };

  useEffect(() => {
    if (step !== 2 || countdown === 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  // Mobile: auto-dismiss the verified screen and continue on. Desktop keeps the Continue button.
  useEffect(() => {
    if (!verified) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const timer = setTimeout(() => {
      goToNextStep();
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      showToast(VALIDATION_TOASTS.missingFields.title, VALIDATION_TOASTS.missingFields.description, "error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast(VALIDATION_TOASTS.invalidEmail.title, VALIDATION_TOASTS.invalidEmail.description, "error");
      return;
    }
    if (!/^(0|\+234)\d{10}$/.test(phone)) {
      showToast(VALIDATION_TOASTS.invalidPhone.title, VALIDATION_TOASTS.invalidPhone.description, "error");
      return;
    }
    if (password.length < 8) {
      showToast(VALIDATION_TOASTS.passwordTooShort.title, VALIDATION_TOASTS.passwordTooShort.description, "error");
      return;
    }
    if (!agreePolicy) {
      showToast(VALIDATION_TOASTS.privacyPolicyRequired.title, VALIDATION_TOASTS.privacyPolicyRequired.description, "error");
      return;
    }

    try {
      setLoading(true);
      const normalizedPhone = normalizePhoneE164(phone);
      await signUp(name, email, normalizedPhone, password);
      setStep(2);
      setCountdown(60);
    } catch {
      // signUp already throws and shows toast
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
      const normalizedPhone = normalizePhoneE164(phone);
      const { error } = await supabase.auth.resend({
        type: "sms",
        phone: normalizedPhone,
      });

      if (error) {
        showToast(VALIDATION_TOASTS.resendFailed.title, VALIDATION_TOASTS.resendFailed.description, "error");
        return;
      }

      setCountdown(60);
      const codeSentMessage = AUTH_TOASTS.codeSent(maskPhone(normalizedPhone));
      showToast(codeSentMessage.title, codeSentMessage.description, "info");
    } catch {
      showToast(VALIDATION_TOASTS.resendFailed.title, VALIDATION_TOASTS.resendFailed.description, "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {step === 1 && (
        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.header}>
            <h1 className={styles.title}>Let's get started</h1>
            <p className={styles.subtitle}>
              Create your account to start reporting, corroborating, and
              staying informed.
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
              Your password should be at least 8 characters, mix of
              uppercase letters, lowercase letters, numbers, and special
              characters (e.g., @, #, $, %).
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
          <button
            type="button"
            className={styles.backLink}
            onClick={() => setStep(1)}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Verification code</h1>
            <p className={styles.subtitle}>
              Check your SMS messages for a 6-digit verification code
            </p>
          </div>

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

          {verified && (
            <div className={styles.overlay}>
              <div className={styles.modalCard}>
                <div className={styles.verifiedIconWrap}>
                  <div className={styles.verifiedIcon}>
                    <Check size={20} color="#fff" />
                  </div>
                </div>

                <h2 className={styles.verifiedTitle}>Phone Verified</h2>
                <p className={styles.verifiedBody}>
                  Your phone number has been successfully verified. You can
                  now report incidents and confirm reports in your
                  community.
                </p>

                <div className={styles.numberCard}>
                  <div className={styles.numberIconWrap}>
                    <Lock size={18} />
                  </div>
                  <div className={styles.numberText}>
                    <span className={styles.numberLabel}>
                      Verified Number
                    </span>
                    <span className={styles.numberValue}>
                      {maskPhone(normalizePhoneE164(phone))}
                    </span>
                  </div>
                  <span className={styles.confirmedPill}>
                    <Check size={14} /> Confirmed
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={goToNextStep}
                >
                  Continue
                </button>

                <p className={styles.privacyNote}>
                  Your number is private and never shared publicly
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SignupPage;
