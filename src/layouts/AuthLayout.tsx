import { Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

const AuthLayout = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <img
          src="/assets/logo/watchly-logo-color.png"
          alt="Watchly"
          className={styles.logo}
        />
        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
