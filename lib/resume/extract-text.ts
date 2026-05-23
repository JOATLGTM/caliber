const MAX_TEXT = 32_000;

/** Extract plain text from an uploaded resume file (PDF only in v1). */
export async function extractTextFromResume(file: File): Promise<string> {
  const mime = file.type || "";

  if (mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return (result.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
    } finally {
      await parser.destroy();
    }
  }

  // DOCX text extraction deferred — skills still merge when resume_text is set elsewhere.
  return "";
}
