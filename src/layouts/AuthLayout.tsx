import { Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

const AuthLayout = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.formSide}>
        <img
          src="/assets/logo/watchly-logo-color.png"
          alt="Watchly"
          className={styles.logo}
        />
        <div className={styles.formContent}>
          <Outlet />
        </div>
      </div>

      <div className={styles.imageSide}>
        <img
          src="/assets/images/auth-collage.jpg"
          alt="auth side image"
          className={styles.collageImage}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
