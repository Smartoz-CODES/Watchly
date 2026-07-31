import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLogo from "../components/AuthLogo/AuthLogo";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { ApiError } from "../lib/api";
import { AUTH_TOASTS } from "../lib/toast-messages";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setIsLoading(true);
      await login(email, password);
      navigate("/home");
    } catch (err) {
      // PHONE_NOT_VERIFIED means the credentials were correct but the
      // account still needs OTP verification. AuthProvider re-throws
      // this specific code without showing its own toast, so it can be
      // handled here — routing straight to verification with the
      // userId the backend returns in error.details, per the
      // integration contract's Section 3 login endpoint notes.
      if (err instanceof ApiError && err.code === "PHONE_NOT_VERIFIED") {
        const userId = err.details?.userId as string | undefined;
        if (userId) {
          navigate(`/signup?step=verify&userId=${userId}`);
          return;
        }
      }

      showToast(
        AUTH_TOASTS.signInFailed.title,
        AUTH_TOASTS.signInFailed.description,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContent}>
      <AuthLogo />
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>
          Login to stay connected with informations happening around you
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordContainer}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className={styles.forgotPassword}>
          <Link to="/forgot-password">Forgot Password</Link>
        </div>
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <p className={styles.accountText}>
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
