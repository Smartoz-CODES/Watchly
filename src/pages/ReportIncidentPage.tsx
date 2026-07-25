import { useState, useEffect } from "react";
import { X, MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import CategorySelector from "../components/CategorySelector/CategorySelector";
import EvidenceUploader from "../components/EvidenceUploader/EvidenceUploader";
import type { IncidentCategory } from "../types/incident";
import styles from "./ReportIncidentPage.module.css";

interface EvidenceFile {
  file: File;
  url: string;
  status: "uploading" | "done" | "failed";
}

const MAX_DESCRIPTION_LENGTH = 500;

// Reports can only be dated within the last 7 days, up to today.
// Prevents both future-dated reports (a logical impossibility) and
// stale reports that no longer reflect current community safety conditions.
const MAX_PAST_DAYS = 7;

const ReportIncidentPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [otherDescription, setOtherDescription] = useState("");
  const [location, setLocation] = useState("");
  const [occurredDate, setOccurredDate] = useState("");
  const [occurredTime, setOccurredTime] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Revoke all evidence object URLs on unmount to release memory held by
  // any attached images that were never submitted (e.g. user closed the modal).
  useEffect(() => {
    return () => {
      evidence.forEach((item) => URL.revokeObjectURL(item.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeForm = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleUpload = (files: File[]) => {
    const newEvidence = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      status: "done" as const,
    }));
    setEvidence((prev) => [...prev, ...newEvidence].slice(0, 5));
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const earliestAllowedDate = new Date(today);
  earliestAllowedDate.setDate(today.getDate() - MAX_PAST_DAYS);

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const isDateOutOfRange = (day: number): boolean => {
    const candidate = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
    );
    return candidate > today || candidate < earliestAllowedDate;
  };

  const handleSelectDate = (day: number) => {
    if (isDateOutOfRange(day)) return;

    const selected = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
    );
    const formatted = `${String(selected.getDate()).padStart(2, "0")}/${String(selected.getMonth() + 1).padStart(2, "0")}/${selected.getFullYear()}`;
    setOccurredDate(formatted);
    setShowCalendar(false);
  };

  const changeMonth = (delta: number) => {
    const next = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + delta,
      1,
    );

    // Don't allow navigating past the current month — nothing selectable lives there.
    if (next > currentMonthStart) return;

    setCalendarMonth(next);
  };

  const getDaysInMonth = (): (number | null)[] => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const days: (number | null)[] = Array(startWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  };

  const handleSubmit = () => {
    if (!category) {
      showToast(
        "Missing category",
        "Please select an incident category.",
        "error",
      );
      return;
    }
    if (category === "Other" && otherDescription.trim() === "") {
      showToast(
        "Missing description",
        "Please specify the incident type.",
        "error",
      );
      return;
    }
    if (location.trim().length < 3) {
      showToast("Invalid location", "Please enter a valid location.", "error");
      return;
    }
    if (!occurredDate) {
      showToast(
        "Missing date",
        "Please select when the incident occurred.",
        "error",
      );
      return;
    }
    if (!occurredTime) {
      showToast(
        "Missing time",
        "Please select when the incident occurred.",
        "error",
      );
      return;
    }
    if (description.trim().length < 10) {
      showToast(
        "Description too short",
        "Description must be at least 10 characters.",
        "error",
      );
      return;
    }

    setSubmitting(true);
    // TODO Day 2: call useIncidents().createIncident(...) with real Supabase data
    setTimeout(() => {
      setSubmitting(false);
      showToast(
        "Report submitted",
        "Your neighbours and community admin have been notified.",
        "success",
      );
      navigate("/home");
    }, 1200);
  };

  const monthLabel = calendarMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const isNextMonthDisabled =
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1) >
    currentMonthStart;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={closeForm}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h1 className={styles.title}>Report an Incident</h1>
        <p className={styles.subtitle}>
          Share what happened to your community can stay informed. Please only
          report what you personally observed
        </p>

        <div className={styles.field}>
          <label className={styles.label}>
            Incident Category<span className={styles.required}>*</span>
          </label>
          <CategorySelector
            selectedCategory={category}
            otherDescription={otherDescription}
            onSelect={setCategory}
            onOtherDescriptionChange={setOtherDescription}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Location<span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <MapPin size={18} className={styles.icon} />
            <input
              type="text"
              placeholder="General area (e.g., near the main gate, Block C parking area)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <p className={styles.hint}>
            This information stays within the community and will never be shared
            with third parties.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            When did it happen?<span className={styles.required}>*</span>
          </label>
          <div className={styles.dateTimeRow}>
            <div className={styles.dateFieldWrapper}>
              <button
                type="button"
                className={styles.dateButton}
                onClick={() => setShowCalendar((prev) => !prev)}
              >
                <CalendarIcon size={18} className={styles.icon} />
                <span
                  className={
                    occurredDate ? styles.filledText : styles.placeholderText
                  }
                >
                  {occurredDate || "Date"}
                </span>
              </button>

              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}>
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <span>{monthLabel}</span>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      aria-label="Next month"
                      disabled={isNextMonthDisabled}
                      className={
                        isNextMonthDisabled ? styles.calendarNavDisabled : ""
                      }
                    >
                      ›
                    </button>
                  </div>
                  <div className={styles.calendarWeekdays}>
                    {weekdayLabels.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className={styles.calendarGrid}>
                    {getDaysInMonth().map((day, index) => {
                      const outOfRange = day !== null && isDateOutOfRange(day);
                      return (
                        <button
                          type="button"
                          key={index}
                          className={`${styles.calendarDay} ${outOfRange ? styles.calendarDayDisabled : ""}`}
                          disabled={day === null || outOfRange}
                          onClick={() => day && handleSelectDate(day)}
                        >
                          {day ?? ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <Clock size={18} className={styles.icon} />
              <input
                type="time"
                value={occurredTime}
                onChange={(e) => setOccurredTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.descriptionHeader}>
            <label className={styles.label}>
              Description<span className={styles.required}>*</span>
            </label>
            <span className={styles.counter}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="What did you see?......"
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Evidence <span className={styles.optional}>(Optional)</span>
          </label>
          <EvidenceUploader
            evidence={evidence}
            onUpload={handleUpload}
            onRemove={handleRemoveEvidence}
            maxFiles={5}
            loading={false}
            progress={0}
          />
        </div>

        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit report"}
        </button>
      </div>
    </div>
  );
};

export default ReportIncidentPage;
