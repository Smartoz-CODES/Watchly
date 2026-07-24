import { useState } from "react";
import { useToast } from "../hooks/use-toast";

import CategorySelector from "../components/CategorySelector/CategorySelector";
import ProgressIndicator from "../components/ProgressIndicator/ProgressIndicator";

import type { IncidentCategory } from "../types/incident";
import styles from "./ReportIncidentPage.module.css";

interface ReportFormState {
  category: IncidentCategory | null;
  otherDescription: string;
  description: string;
  occurredAt: string;
  location: string;
  evidence: {
    file: File;
    url: string;
    status: "uploading" | "done" | "failed";
  }[];
  currentStep: number;
}

const ReportIncidentPage = () => {
  const [form, setForm] = useState<ReportFormState>({
    category: null,
    otherDescription: "",
    description: "",
    occurredAt: "",
    location: "",
    evidence: [],
    currentStep: 1,
  });

  const { showToast } = useToast();

  const nextStep = () => {
    if (form.currentStep === 1) {
      if (!form.category) {
        showToast("Please select a category.", "error");
        return;
      }
      if (form.category === "Other" && form.otherDescription.trim() === "") {
        showToast("Please specify the incident type.", "error");
        return;
      }
    }

    if (form.currentStep === 2) {
      if (form.description.trim().length < 10) {
        showToast("Description must be at least 10 characters.", "error");
        return;
      }
      if (!form.occurredAt) {
        showToast("Please choose when the incident occurred.", "error");
        return;
      }
    }

    if (form.currentStep === 3) {
      if (form.location.trim().length < 3) {
        showToast("Please enter a valid location.", "error");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const previousStep = () => {
    setForm((prev) => ({
      ...prev,
      currentStep: prev.currentStep - 1,
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Report an Incident</h1>

        <ProgressIndicator currentStep={form.currentStep} totalSteps={6} />

        {form.currentStep === 1 && (
          <CategorySelector
            selectedCategory={form.category}
            otherDescription={form.otherDescription}
            onSelect={(category) =>
              setForm((prev) => ({ ...prev, category }))
            }
            onOtherDescriptionChange={(value) =>
              setForm((prev) => ({ ...prev, otherDescription: value }))
            }
          />
        )}

        {form.currentStep === 2 && (
          <div className={styles.stepSection}>
            <h2 className={styles.stepHeading}>Incident Details</h2>

            <textarea
              className={styles.textarea}
              placeholder="Describe what happened"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <input
              className={styles.input}
              type="datetime-local"
              value={form.occurredAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, occurredAt: e.target.value }))
              }
            />
          </div>
        )}

        {form.currentStep === 3 && (
          <div className={styles.stepSection}>
            <h2 className={styles.stepHeading}>Location</h2>

            <input
              className={styles.input}
              type="text"
              placeholder="General area (e.g., near the main gate)"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
        )}

        {form.currentStep === 4 && (
          <div className={styles.placeholderStep}>Step 4 Placeholder</div>
        )}
        {form.currentStep === 5 && (
          <div className={styles.placeholderStep}>Step 5 Placeholder</div>
        )}
        {form.currentStep === 6 && (
          <div className={styles.placeholderStep}>Step 6 Placeholder</div>
        )}

        <div className={styles.actions}>
          {form.currentStep > 1 && (
            <button
              type="button"
              className={styles.backButton}
              onClick={previousStep}
            >
              Back
            </button>
          )}

          {form.currentStep < 6 && (
            <button
              type="button"
              className={styles.nextButton}
              onClick={nextStep}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentPage;