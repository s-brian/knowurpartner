/**
 * Normalizes punctuation in displayed report text (e.g. em dashes from models).
 */
export function stripEmDashes(text: string): string {
  return text
    .replace(/\u2014/g, ", ")
    .replace(/\u2013/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}
