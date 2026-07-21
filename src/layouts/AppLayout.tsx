import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

// Shell

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
