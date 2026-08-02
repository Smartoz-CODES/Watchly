import { useState, useCallback } from "react";
import { incidentsApi, isApiError } from "../lib/api";

export interface UseEvidenceReturn {
  uploadEvidence: (incidentId: string, file: File) => Promise<string>;
  loading: boolean;
  progress: number;
  error: string | null;
}

export function useEvidence(): UseEvidenceReturn {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadEvidence = useCallback(
    async (incidentId: string, file: File): Promise<string> => {
      setLoading(true);
      setError(null);
      setProgress(0);
      try {
        const [evidence] = await incidentsApi.uploadEvidence(incidentId, [
          file,
        ]);
        setProgress(100);
        return evidence.file_url;
      } catch (err) {
        setError(isApiError(err) ? err.message : "Upload failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { uploadEvidence, loading, progress, error };
}
