import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";

import OTPInput from "../components/OTPInput/OTPInput";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

import styles from "../styles/SignupPage.module.css";

const SignupPage = () => {
  const { signUp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [agreePolicy, setAgreePolicy] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (step !== 2 || countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      showToast("Please fill all fields.", "error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("Enter a valid email address.", "error");
      return;
    }

    if (!/^(0|\+234)\d{10}$/.test(phone)) {
      showToast("Enter a valid Nigerian phone number.", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    if (!agreePolicy) {
      showToast("Please agree to the Privacy Policy.", "error");
      return;
    }

    try {
      setLoading(true);

      await signUp(name, email, phone, password);

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

      await verifyOtp(phone, otp);

      const slug = new URLSearchParams(window.location.search).get("community");

      navigate(slug ? "/home" : "/communities");
    } catch {
      setOtpError("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCountdown(60);

    showToast("Verification code sent.", "success");
  };

  return (
    <>
      {step === 1 && (
        <form className={styles.form} onSubmit={handleSignup}>
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
              <User size={20} className={styles.icon} />

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>

            <div className={styles.inputWrapper}>
              <Mail size={20} className={styles.icon} />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>

            <div className={styles.inputWrapper}>
              <Phone size={20} className={styles.icon} />

              <input
                id="phone"
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
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
              <Lock size={20} className={styles.icon} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              Your password should be at least 8 characters and include
              uppercase, lowercase, numbers and a special character (e.g. @, #,
              $, %).
            </p>
          </div>

          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={agreePolicy}
              onChange={(e) => setAgreePolicy(e.target.checked)}
            />

            <span>
              I agree with the{" "}
              <span className={styles.policyLink}>Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Get Started"}
          </button>

          <p className={styles.footerText}>
            Have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <div className={styles.form}>
          <div className={styles.header}>
            <h1 className={styles.title}>Verify Phone Number</h1>

            <p className={styles.subtitle}>
              Enter the verification code sent to <strong>{phone}</strong>
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
            <span>Didn't receive the code?</span>

            <button
              type="button"
              className={styles.resendButton}
              disabled={countdown > 0}
              onClick={handleResendCode}
            >
              {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
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
    </>
  );
};

export default SignupPage;
