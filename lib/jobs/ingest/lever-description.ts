import { htmlToPlainText } from "./text";

/** Lever list endpoint — fields that may carry JD text (varies by employer). */
export interface LeverPostingContent {
  openingPlain?: string;
  descriptionPlain?: string;
  descriptionBodyPlain?: string;
  additionalPlain?: string;
  opening?: string;
  description?: string;
  descriptionBody?: string;
  additional?: string;
  lists?: { text?: string; content?: string }[];
}

/**
 * Merge all Lever text/HTML blocks into one plain description.
 * Some employers (e.g. Spotify) leave descriptionPlain empty and put content in lists[].
 */
export function buildLeverDescription(job: LeverPostingContent): string {
  const parts: string[] = [];

  const plainFields = [
    job.openingPlain,
    job.descriptionPlain,
    job.descriptionBodyPlain,
    job.additionalPlain,
  ];
  for (const field of plainFields) {
    if (field?.trim()) parts.push(field.trim());
  }

  if (!parts.length) {
    const htmlFields = [job.opening, job.description, job.descriptionBody, job.additional];
    for (const field of htmlFields) {
      if (field?.trim()) parts.push(htmlToPlainText(field));
    }
  }

  for (const list of job.lists ?? []) {
    if (list.text?.trim()) parts.push(list.text.trim());
    if (list.content?.trim()) parts.push(htmlToPlainText(list.content));
  }

  return parts.join("\n\n").slice(0, 32_000);
}
