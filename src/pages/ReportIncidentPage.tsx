import { useState } from "react";
import { useToast } from "../hooks/use-toast";

import CategorySelector from "../components/CategorySelector/CategorySelector";
import ProgressIndicator from "../components/ProgressIndicator/ProgressIndicator";

import type { IncidentCategory } from "../types/incident";

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
  // Step 1 validation
  if (form.currentStep === 1) {
    if (!form.category) {
      showToast("Please select a category.", "error");
      return;
    }

    if (
      form.category === "Other" &&
      form.otherDescription.trim() === ""
    ) {
      showToast("Please specify the incident type.", "error");
      return;
    }
  }

  // Step 2 validation
  if (form.currentStep === 2) {
    if (form.description.trim().length < 10) {
      showToast(
        "Description must be at least 10 characters.",
        "error"
      );
      return;
    }

    if (!form.occurredAt) {
      showToast(
        "Please choose when the incident occurred.",
        "error"
      );
      return;
    }
  }

  // Step 3 validation
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
    <div>
      <h1>Report an Incident</h1>

     

     
      <ProgressIndicator
  currentStep={form.currentStep}
  totalSteps={6}
/>

{form.currentStep === 1 && (
  <CategorySelector
    selectedCategory={form.category}
    otherDescription={form.otherDescription}
    onSelect={(category) =>
      setForm((prev) => ({
        ...prev,
        category,
      }))
    }
    onOtherDescriptionChange={(value) =>
      setForm((prev) => ({
        ...prev,
        otherDescription: value,
      }))
    }
  />
)}

{form.currentStep === 2 && (
  <div>
    <h2>Incident Details</h2>

    <textarea
      placeholder="Describe what happened"
      value={form.description}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          description: e.target.value,
        }))
      }
    />

    <br />
    <br />

    <input
      type="datetime-local"
      value={form.occurredAt}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          occurredAt: e.target.value,
        }))
      }
    />
  </div>
)}

{form.currentStep === 3 && (
  <div>
    <h2>Location</h2>

    <input
      type="text"
      placeholder="General area (e.g., near the main gate)"
      value={form.location}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          location: e.target.value,
        }))
      }
    />
  </div>
)}

{form.currentStep === 4 && <div>Step 4 Placeholder</div>}
{form.currentStep === 5 && <div>Step 5 Placeholder</div>}
{form.currentStep === 6 && <div>Step 6 Placeholder</div>}

<div style={{ marginTop: "24px" }}>
  {form.currentStep > 1 && (
    <button type="button" onClick={previousStep}>
      Back
    </button>
  )}

  {form.currentStep < 6 && (
    <button type="button" onClick={nextStep}>
      Next
    </button>
  )}
</div>

    </div>
  );
};

export default ReportIncidentPage;