const MAX_TITLE_LENGTH = 60;

// No dedicated "title" field exists on Incident — this derives a short
// headline from the first sentence of the description. Returns null when
// the description has no sentence break and is short enough that the
// "title" would just be the description itself, so callers can skip
// rendering it as a separate line instead of printing the same text twice.
export function incidentTitleFrom(description: string): string | null {
  const trimmed = description.trim();
  const firstSentence = trimmed.split(".")[0].trim();

  if (firstSentence.length > MAX_TITLE_LENGTH) {
    return `${firstSentence.slice(0, MAX_TITLE_LENGTH)}…`;
  }

  if (firstSentence === trimmed) {
    return null;
  }

  return firstSentence;
}
