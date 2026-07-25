import styles from "./SkeletonCard.module.css";

const SkeletonCard = () => {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.avatar} />
          <div className={styles.identityText}>
            <div className={styles.line} style={{ width: "12rem" }} />
            <div className={styles.line} style={{ width: "18rem" }} />
          </div>
        </div>
        <div className={styles.badge} />
      </div>

      <div className={styles.tag} />

      <div className={styles.line} style={{ width: "70%", height: "1.8rem" }} />

      <div className={styles.line} style={{ width: "100%" }} />
      <div className={styles.line} style={{ width: "85%" }} />

      <div className={styles.footer}>
        <div className={styles.line} style={{ width: "10rem" }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
