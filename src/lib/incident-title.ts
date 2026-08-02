const MAX_TITLE_LENGTH = 60;
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
