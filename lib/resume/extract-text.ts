const MAX_TEXT = 32_000;

/** Extract plain text from an uploaded resume file (PDF or DOCX). */
export async function extractTextFromResume(file: File): Promise<string> {
  const mime = file.type || "";
  const name = file.name.toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
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

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return (result.value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
  }

  return "";
}
