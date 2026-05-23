const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Decode common HTML entities (Greenhouse returns escaped HTML). */
export function decodeHtmlEntities(input: string): string {
  let out = input;
  for (const [entity, char] of Object.entries(ENTITY_MAP)) {
    out = out.split(entity).join(char);
  }
  out = out.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(Number(code)),
  );
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  return out;
}

/** Strip tags and collapse whitespace for storage / skill extraction. */
export function htmlToPlainText(html: string): string {
  const decoded = decodeHtmlEntities(html);
  const noTags = decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return noTags.slice(0, 32_000);
}

export function truncate(text: string, max = 32_000): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}
