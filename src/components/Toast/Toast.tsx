import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useToastState } from "../../hooks/use-toast";
import styles from "./Toast.module.css";

const icons = {
  success: <CheckCircle size={20} aria-hidden="true" />,
  error: <AlertCircle size={20} aria-hidden="true" />,
  info: <Info size={20} aria-hidden="true" />,
};

const Toast = () => {
  const { toast, clearToast } = useToastState();

  useEffect(() => {
    if (!toast) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearToast();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={styles.icon}>{icons[toast.type]}</span>

      <div className={styles.textGroup}>
        <p className={styles.title}>{toast.title}</p>
        <p className={styles.description}>{toast.description}</p>
      </div>

      <button
        className={styles.closeButton}
        onClick={clearToast}
        type="button"
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
