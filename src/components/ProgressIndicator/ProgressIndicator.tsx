import styles from "./ProgressIndicator.module.css";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;

          return (
            <div
              key={step}
              className={`${styles.dot} ${
                step <= currentStep ? styles.active : ""
              }`}
            />
          );
        })}
      </div>

      <p className={styles.label}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
};

export default ProgressIndicator;