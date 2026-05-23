import type { JobField, Seniority, WorkMode } from "@/lib/mock-data";

export function inferWorkMode(
  location: string,
  hints: string,
  explicit?: string | null,
): WorkMode {
  const blob = `${location} ${hints} ${explicit ?? ""}`.toLowerCase();
  if (explicit) {
    const e = explicit.toLowerCase();
    if (e.includes("remote")) return "Remote";
    if (e.includes("hybrid")) return "Hybrid";
    if (e.includes("onsite") || e.includes("on-site") || e.includes("office"))
      return "Onsite";
  }
  if (blob.includes("remote") && !blob.includes("hybrid")) return "Remote";
  if (blob.includes("hybrid")) return "Hybrid";
  if (blob.includes("onsite") || blob.includes("on-site")) return "Onsite";
  return "Hybrid";
}

export function inferSeniority(title: string, description: string): Seniority {
  const t = `${title} ${description}`.toLowerCase();
  if (
    /\b(intern|entry.?level|junior|graduate|new grad)\b/.test(t)
  )
    return "Entry";
  if (/\b(staff|principal|distinguished|fellow|vp|director)\b/.test(t))
    return "Staff+";
  if (/\b(senior|sr\.|lead|manager|head of)\b/.test(t)) return "Senior";
  return "Mid";
}

export function inferField(
  title: string,
  department: string,
  description: string,
): JobField {
  const blob = `${title} ${department} ${description}`.toLowerCase();
  if (/\b(product manager|product management|pm\b)/.test(blob)) return "pm";
  if (/\b(designer|ux|ui\/ux|product design|visual design)\b/.test(blob))
    return "design";
  if (/\b(marketing|growth|seo|content strategist|brand)\b/.test(blob))
    return "marketing";
  if (/\b(nurse|clinical|physician|healthcare|medical)\b/.test(blob))
    return "healthcare";
  if (/\b(finance|accounting|fp&a|investment|banking)\b/.test(blob))
    return "finance";
  if (/\b(customer success|support|account executive|sales)\b/.test(blob))
    return "cs";
  return "software";
}

/** Parse salary display string and minimum annual USD (best effort). */
export function parseSalaryFromText(text: string): {
  salary: string;
  salaryMin: number;
} {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return { salary: "", salaryMin: 0 };

  const range = cleaned.match(
    /\$?\s*([\d,]+)\s*k?\s*[-–—to]+\s*\$?\s*([\d,]+)\s*k?/i,
  );
  if (range) {
    const low = parseMoneyToken(range[1], cleaned);
    const high = parseMoneyToken(range[2], cleaned);
    const salaryMin = Math.min(low, high) || low || high;
    return {
      salary: formatSalaryRange(salaryMin, Math.max(low, high)),
      salaryMin,
    };
  }

  const single = cleaned.match(/\$?\s*([\d,]+)\s*k?\+?/i);
  if (single) {
    const n = parseMoneyToken(single[1], cleaned);
    return { salary: formatSalaryK(n), salaryMin: n };
  }

  return { salary: cleaned.slice(0, 80), salaryMin: 0 };
}

function parseMoneyToken(token: string, context: string): number {
  const n = parseInt(token.replace(/,/g, ""), 10);
  if (!Number.isFinite(n)) return 0;
  const isK = /k/i.test(token) || /\bk\b/i.test(context);
  return isK && n < 1000 ? n * 1000 : n < 1000 ? n * 1000 : n;
}

function formatSalaryK(amount: number): string {
  if (amount <= 0) return "";
  return `$${Math.round(amount / 1000)}k`;
}

function formatSalaryRange(low: number, high: number): string {
  if (low <= 0 && high <= 0) return "";
  if (high > low && high > 0) return `${formatSalaryK(low)}–${formatSalaryK(high)}`;
  return formatSalaryK(low || high);
}

export function toPostedDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return new Date().toISOString().slice(0, 10);
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function stableJobId(source: string, externalId: string): string {
  return `${source}:${externalId}`;
}
