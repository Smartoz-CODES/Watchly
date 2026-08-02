import type { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: LucideIcon;
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon: Icon,
  imageSrc,
  imageAlt = "",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      {imageSrc ? (
        <img src={imageSrc} alt={imageAlt} className={styles.illustration} />
      ) : (
        Icon && <Icon size={48} className={styles.icon} aria-hidden="true" />
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
