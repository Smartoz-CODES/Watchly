import { AlertTriangle } from "lucide-react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className={styles.container}>
      <AlertTriangle size={48} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
};

export default ErrorState;
