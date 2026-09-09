import type { InternalLink, ServiceRecord } from "./excel";
import { parsePriority } from "./excel";
import {
  isAutoColumn,
  replacePlaceholders,
  remainingPlaceholders,
  sanitizeFilename,
} from "./placeholders";

const MAX_LINKS = 40;

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

export function countLinkSlots(columns: string[]): number {
  let max = 0;
  for (const col of columns) {
    const m = /^INTERNAL_LINK_(\d+)_/.exec(col);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

export function selectLinks(
  links: InternalLink[],
  currentUrl: string,
  maxLinks: number,
): Array<{ ANCHOR_TEXT: string; PAGE_URL: string }> {
  const limit = Math.min(maxLinks || MAX_LINKS, MAX_LINKS);
  const current = normalizeUrl(currentUrl);
  const best = new Map<string, { priority: number; index: number; link: InternalLink }>();

  links.forEach((link, index) => {
    const url = link.PAGE_URL.trim();
    const text = link.ANCHOR_TEXT.trim();
    if (!url || !text) return;
    if (current && normalizeUrl(url) === current) return;
    const priority = parsePriority(link.LINK_PRIORITY);
    if (!priority) return;
    const key = normalizeUrl(url);
    const prev = best.get(key);
    if (!prev || priority < prev.priority || (priority === prev.priority && index < prev.index)) {
      best.set(key, { priority, index, link });
    }
  });

  const buckets: Record<1 | 2 | 3, InternalLink[]> = { 1: [], 2: [], 3: [] };
  const ordered = [...best.values()].sort((a, b) => a.index - b.index);
  for (const item of ordered) {
    buckets[item.priority as 1 | 2 | 3].push(item.link);
  }

  const selected: Array<{ ANCHOR_TEXT: string; PAGE_URL: string }> = [];
  for (const p of [1, 2, 3] as const) {
    for (const link of buckets[p]) {
      if (selected.length >= limit) break;
      selected.push({ ANCHOR_TEXT: link.ANCHOR_TEXT, PAGE_URL: link.PAGE_URL });
    }
  }
  return selected;
}

export function linksToValues(
  selected: Array<{ ANCHOR_TEXT: string; PAGE_URL: string }>,
  slots: number,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (let i = 1; i <= slots; i++) {
    const link = selected[i - 1];
    values[`INTERNAL_LINK_${i}_TEXT`] = link?.ANCHOR_TEXT ?? "";
    values[`INTERNAL_LINK_${i}_URL`] = link?.PAGE_URL ?? "";
  }
  return values;
}

export type ValidationIssue = {
  severity: "error" | "warning";
  error_type: string;
  sheet: string;
  row?: number | string;
  column?: string;
  current_value?: string;
  suggested_fix: string;
};

export type ValidateResult = {
  ok: boolean;
  placeholders: string[];
  matched: number;
  missing: string[];
  extra: string[];
  issues: ValidationIssue[];
  rowCount: number;
  needsInternalLinks: boolean;
};

export function validateCoverage(
  placeholders: string[],
  headers: string[],
  records: ServiceRecord[],
): ValidateResult {
  const issues: ValidationIssue[] = [];
  const headerSet = new Set(headers.filter(Boolean));
  const contentCols = placeholders.filter((c) => !isAutoColumn(c));
  const autoCols = placeholders.filter((c) => isAutoColumn(c));
  const missing = contentCols.filter((c) => !headerSet.has(c));
  const extra = headers.filter(
    (h) =>
      h &&
      h !== "OUTPUT_FILENAME" &&
      !placeholders.includes(h) &&
      !isAutoColumn(h),
  );

  for (const col of missing) {
    issues.push({
      severity: "error",
      error_type: "Missing Placeholder",
      sheet: "service_pages",
      column: col,
      current_value: "Column not found",
      suggested_fix: `Add column ${col} to the Excel sheet`,
    });
  }

  if (!headerSet.has("OUTPUT_FILENAME") && !records.every((r) => r.OUTPUT_FILENAME)) {
    issues.push({
      severity: "error",
      error_type: "Missing System Column",
      sheet: "service_pages",
      column: "OUTPUT_FILENAME",
      suggested_fix: "Add OUTPUT_FILENAME or SLUG column",
    });
  }

  if (!records.length) {
    issues.push({
      severity: "error",
      error_type: "No Service Rows",
      sheet: "service_pages",
      suggested_fix: "Add at least one data row",
    });
  }

  const seen = new Map<string, number>();
  for (const record of records) {
    const filename = sanitizeFilename(record.OUTPUT_FILENAME ?? "");
    if (!filename) {
      issues.push({
        severity: "error",
        error_type: "Missing Output Filename",
        sheet: "service_pages",
        row: record._excel_row,
        column: "OUTPUT_FILENAME",
        suggested_fix: "Enter OUTPUT_FILENAME or SLUG for this row",
      });
    } else {
      const key = filename.toLowerCase();
      if (seen.has(key)) {
        issues.push({
          severity: "error",
          error_type: "Duplicate Output Filename",
          sheet: "service_pages",
          row: record._excel_row,
          column: "OUTPUT_FILENAME",
          current_value: filename,
          suggested_fix: `Filename already used on row ${seen.get(key)}`,
        });
      } else {
        seen.set(key, record._excel_row);
      }
    }

    for (const col of contentCols) {
      if (!(col in record)) continue;
      if (!String(record[col] ?? "").trim()) {
        issues.push({
          severity: "error",
          error_type: `Missing ${col}`,
          sheet: "service_pages",
          row: record._excel_row,
          column: col,
          suggested_fix: `Enter a value for ${col}`,
        });
      }
    }
  }

  for (const col of extra) {
    issues.push({
      severity: "warning",
      error_type: "Unused Excel Column",
      sheet: "service_pages",
      column: col,
      suggested_fix: `Column ${col} is not used in the HTML template`,
    });
  }

  const needsLinks = placeholders.some((c) => c.startsWith("INTERNAL_LINK_"));
  const ok =
    missing.length === 0 &&
    issues.filter((i) => i.severity === "error").length === 0;

  return {
    ok,
    placeholders,
    matched: contentCols.length - missing.length,
    missing,
    extra,
    issues,
    rowCount: records.length,
    needsInternalLinks: needsLinks,
  };
}

export function generatePageHtml(
  masterHtml: string,
  placeholders: string[],
  record: ServiceRecord,
  links: InternalLink[],
): { filename: string; html: string } {
  const slots = countLinkSlots(placeholders);
  const values: Record<string, string> = {};

  for (const col of placeholders) {
    if (isAutoColumn(col)) continue;
    values[col] = String(record[col] ?? "");
  }
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith("_")) continue;
    if (isAutoColumn(key)) continue;
    values[key] = String(value ?? "");
  }

  const currentUrl = String(record.CANONICAL_URL || record.OG_URL || "");
  const selected = selectLinks(links, currentUrl, slots || MAX_LINKS);
  Object.assign(values, linksToValues(selected, slots));

  // Clear unused hreflang slots if present
  for (const col of placeholders) {
    if (col.startsWith("HREFLANG_") && !(col in values)) {
      values[col] = "";
    }
  }

  const html = replacePlaceholders(masterHtml, values);
  const leftover = remainingPlaceholders(html);
  if (leftover.length) {
    throw new Error(`Unresolved placeholders: ${leftover.slice(0, 8).join(", ")}`);
  }

  const filename = sanitizeFilename(record.OUTPUT_FILENAME ?? `row-${record._excel_row}.html`);
  return { filename, html };
}
