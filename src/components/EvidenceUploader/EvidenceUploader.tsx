import { useRef, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

import styles from "./EvidenceUploader.module.css";
import { useToast } from "../../hooks/use-toast";

interface EvidenceFile {
  url: string;
  file: File;
}

interface EvidenceUploaderProps {
  evidence: EvidenceFile[];
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles: number;
  loading: boolean;
  progress: number;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const EvidenceUploader = ({
  evidence,
  onUpload,
  onRemove,
  maxFiles,
  loading,
  progress,
}: EvidenceUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const openFilePicker = () => {
    if (evidence.length >= maxFiles) return;
    fileInputRef.current?.click();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;

    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast(
          "Invalid file type",
          "Only JPEG and PNG images are allowed.",
          "error",
        );
        return;
      }

      if (file.size > MAX_SIZE) {
        showToast(
          "File too large",
          "Each image must be smaller than 5MB.",
          "error",
        );
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }

    event.target.value = "";
  };

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={handleFiles}
      />

      <button
        type="button"
        className={`${styles.uploadArea} ${
          evidence.length >= maxFiles ? styles.disabled : ""
        }`}
        onClick={openFilePicker}
        disabled={evidence.length >= maxFiles || loading}
      >
        <Upload size={24} />
        <span>
          {evidence.length >= maxFiles
            ? "Maximum images reached"
            : "Upload Evidence"}
        </span>
      </button>

      {progress > 0 && progress < 100 && (
        <div className={styles.progressWrapper}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className={styles.previewGrid}>
        {evidence.map((item, index) => (
          <div key={index} className={styles.previewCard}>
            <img
              src={item.url}
              alt={`Evidence ${index + 1}`}
              className={styles.previewImage}
            />

            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onRemove(index)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceUploader;
