import { useState } from "react";
import { X, Info, ShieldCheck, CheckCircle2, Users } from "lucide-react";
import { useCommunities } from "../../hooks/use-communities";
import { useToast } from "../../hooks/use-toast";
import type { Community } from "../../types/community";
import styles from "./CommunityRequestModal.module.css";

// NOTE: states-lgas.json's actual shape hasn't been confirmed in this
// session — assuming Record<state, lga[]> here per the LLD's description
// ("36 states + FCT, each with its LGAs"). Adjust the import/typing below
// if the real file is shaped differently.
import statesLgas from "../../lib/states-lgas.json";

const STATE_LGA_DATA = statesLgas as Record<string, string[]>;
const STATES = Object.keys(STATE_LGA_DATA);

interface CommunityRequestModalProps {
  onClose: () => void;
  onJoinCommunity?: (communityId: string) => void;
  initialState?: string;
  initialLga?: string;
}

type Step = "form" | "duplicates" | "success";

const CommunityRequestModal = ({
  onClose,
  onJoinCommunity,
  initialState = "",
  initialLga = "",
}: CommunityRequestModalProps) => {
  const { requestCommunity, duplicates } = useCommunities();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [state, setState] = useState(initialState);
  const [lga, setLga] = useState(initialLga);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; state?: string; lga?: string }>(
    {}
  );

  const handleStateChange = (value: string) => {
    setState(value);
    setLga(""); // reset LGA whenever state changes, same behavior as StateLGAFilter
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Community name is required";
    if (!state) next.state = "State is required";
    if (!lga) next.lga = "LGA is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await requestCommunity({ name: name.trim(), state, lga });
      setStep(result === "duplicates" ? "duplicates" : "success");
    } catch {
      // requestCommunity is currently a stub that always throws — see
      // hooks/use-communities.ts. Show an honest message rather than
      // pretending this failed for a normal reason.
      showToast(
        "Request not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "form" && (
          <>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Request a New Community</h2>
                <p className={styles.subtitle}>
                  Can't find your community? Submit a request and our platform
                  administrators will review it.
                </p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoBanner}>
              <Info size={18} className={styles.infoIcon} />
              <p>
                Requests are reviewed within 2-3 business days. You'll be notified by
                email and in-app notification of the outcome.
              </p>
            </div>

            <label className={styles.fieldLabel} htmlFor="community-name">
              Community Name<span className={styles.required}>*</span>
            </label>
            <input
              id="community-name"
              type="text"
              className={styles.fieldInput}
              placeholder="e.g Landmark Estate"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className={styles.fieldHint}>
              💡 This information stays within the community and will never be shared
              with third parties.
            </p>
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}

            <label className={styles.fieldLabel} htmlFor="state-select">
              State<span className={styles.required}>*</span>
            </label>
            <select
              id="state-select"
              className={styles.fieldSelect}
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="">Select a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && <p className={styles.fieldError}>{errors.state}</p>}

            <label className={styles.fieldLabel} htmlFor="lga-select">
              Local government area (LGA)<span className={styles.required}>*</span>
            </label>
            <select
              id="lga-select"
              className={styles.fieldSelect}
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              disabled={!state}
            >
              <option value="">{state ? "Select an LGA" : "Select a state first"}</option>
              {(STATE_LGA_DATA[state] ?? []).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {!state && <p className={styles.fieldHint}>LGA options will appear after selecting a state</p>}
            {errors.lga && <p className={styles.fieldError}>{errors.lga}</p>}

            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit Request"}
            </button>
            <button type="button" className={styles.cancelLink} onClick={onClose}>
              Cancel
            </button>

            <p className={styles.footerNote}>
              <ShieldCheck size={14} />
              Your identity is protected. Only community administrators will see your
              account details.
            </p>
          </>
        )}

        {/* No Figma reference for this state — built from the LLD's
            documented behavior (FR-06 / §8.7): if the normalized name +
            state + LGA matches an existing community, show it with a join
            button instead of a pending confirmation. */}
        {step === "duplicates" && (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Similar community found</h2>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
            <p className={styles.subtitle}>
              A similar community already exists. Would you like to join it instead?
            </p>

            <div className={styles.duplicatesList}>
              {duplicates.map((community: Community) => (
                <div key={community.community_id} className={styles.duplicateCard}>
                  <div>
                    <p className={styles.duplicateName}>{community.name}</p>
                    <p className={styles.duplicateLocation}>
                      {community.lga}, {community.state}
                    </p>
                    <p className={styles.duplicateMembers}>
                      <Users size={14} />
                      {community.member_count} members
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.joinButton}
                    onClick={() => onJoinCommunity?.(community.community_id)}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className={styles.cancelLink} onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {/* Also no Figma reference — styled to match the success-modal
            language from the corroboration/report-submitted confirmations
            shared earlier (icon in circle, centered title + message, single
            full-width button). */}
        {step === "success" && (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className={styles.title}>Request submitted</h2>
            <p className={styles.subtitle}>
              Your community request has been submitted and is pending review. You'll be
              notified by email and in-app notification once a decision is made.
            </p>
            <button type="button" className={styles.submitButton} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityRequestModal;