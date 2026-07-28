import { useState, useCallback } from "react";

export interface UseEvidenceReturn {
  uploadEvidence: (incidentId: string, file: File) => Promise<string>;
  loading: boolean;
  progress: number;
  error: string | null;
}

// Shell — no upload happens yet. Returns a rejected promise so a caller
// knows immediately this isn't wired, rather than silently succeeding with
// a fake URL. Real implementation is drafted below, commented out, pending
// answers from backend (see OPEN QUESTIONS block).
export function useEvidence(): UseEvidenceReturn {
  const [loading] = useState(false);
  const [progress] = useState(0);
  const [error] = useState<string | null>(null);

  const uploadEvidence = useCallback(async (): Promise<string> => {
    throw new Error("useEvidence.uploadEvidence is not implemented yet");
  }, []);

  return { uploadEvidence, loading, progress, error };
}

/*
=====================================================================
OPEN QUESTIONS FOR BACKEND
=====================================================================

1. Upload path: does the client upload straight to Supabase Storage
   (supabase.storage.from(bucket).upload(...)), or does the file go
   through an Edge Function (POST /incidents/:id/evidence per the TRD)
   that handles the storage write server-side? These have very different
   client code — direct storage upload vs. sending a File/FormData to an
   Edge Function.

2. If it's a direct Storage upload: what's the actual bucket name, and
   what path/key convention (e.g. "{incident_id}/{uuid}.jpg")? Also,
   Supabase JS v2's storage.upload() is fetch-based and doesn't expose
   upload progress — confirm whether real progress tracking is actually
   required for MVP, or whether an indeterminate spinner is acceptable,
   since accurate 0-100 progress would need a raw XHR against a signed
   URL instead.

3. If it goes through an Edge Function instead: same function-naming
   question as use-incidents.ts — what's it actually called, and does it
   accept multipart/FormData or a base64 body?

4. File-header validation: the TRD requires validating JPEG/PNG by file
   header, not extension (§4.3, FR-10). Is that check done server-side
   only, or does the client need to read the file's magic bytes before
   upload too? Right now EvidenceUploader only checks MIME type and size
   client-side, per the handoff doc.

5. Response shape: does upload return just a file_url string (per the
   LLD's documented return type), or the full incident_evidence row
   (evidence_id, file_type, uploaded_by, etc.)? If it's the full row and
   ReportIncidentPage needs evidence_id later, the return type here is
   too narrow.

=====================================================================
DRAFT IMPLEMENTATION (Storage-direct variant) — matches LLD §6.8
contract, uncomment and adjust once the above is confirmed. Also add:
  import { supabase } from "../lib/supabase";
at the top of the file.
=====================================================================

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
        const path = `${incidentId}/${crypto.randomUUID()}-${file.name}`; // TODO confirm bucket/key convention

        // NOTE: supabase-js v2's storage.upload() has no progress
        // callback. Progress stays at 0 until completion, or this needs
        // to be replaced with a raw XHR against a signed upload URL if
        // real incremental progress is required (see OPEN QUESTIONS #2).
        const { error: uploadError } = await supabase.storage
          .from("incident-evidence") // TODO confirm bucket name
          .upload(path, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("incident-evidence")
          .getPublicUrl(path);

        setProgress(100);
        return publicUrlData.publicUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { uploadEvidence, loading, progress, error };
}
*/