import { type ReactNode } from "react";
import styles from "./LandingLayout.module.css";

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  return <div className={styles.wrapper}>{children}</div>;
};

export default LandingLayout;