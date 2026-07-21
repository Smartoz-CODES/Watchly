import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

// ─── Shell ────────────────────────────────────────────────────────────────────
// Day 1 shell. Renders the matched child route via Outlet with no navigation.
// Full implementation ships in feature/layout on Day 2.

const AppLayout = () => {
  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
