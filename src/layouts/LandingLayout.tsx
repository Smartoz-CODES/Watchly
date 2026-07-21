import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingLayout.module.css";

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      {/* ── Public header  */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Watchly logo */}
          <img
            src="/assets/logo/watchly-logo-color.png"
            alt="Watchly"
            className={styles.logo}
          />

          {/* Sign Up button */}
          <button
            className={styles.signUpButton}
            onClick={() => navigate("/signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main content, renders here — hero section, filters, community cards */}
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default LandingLayout;
