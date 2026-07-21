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
      {/* ── Public header ─────────────────────────────────────────────────────
          Sticky header visible on the landing page only.
          Logo left, Sign Up button right.
          TRD FR-04: "The landing page header includes a Sign Up button
          for direct registration without browsing."
      ──────────────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Watchly logo — color variant for white header background */}
          <img
            src="/assets/logo/watchly-logo-color.png"
            alt="Watchly"
            className={styles.logo}
          />

          {/* Sign Up button — Primary Medium per Button_Token spec */}
          <button
            className={styles.signUpButton}
            onClick={() => navigate("/signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────────
          LandingPage renders here — hero section, filters, community cards.
      ──────────────────────────────────────────────────────────────────── */}
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default LandingLayout;
