import * as XLSX from "xlsx";
import { sanitizeFilename } from "./placeholders";

export type ServiceRecord = {
  _excel_row: number;
  OUTPUT_FILENAME?: string;
  [key: string]: string | number | undefined;
};

export type InternalLink = {
  _excel_row: number;
  ANCHOR_TEXT: string;
  PAGE_URL: string;
  LINK_PRIORITY: string;
};

function cellStr(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function pickSheet(wb: XLSX.WorkBook, preferred: string[]): XLSX.WorkSheet {
  const lowerPreferred = preferred.map((p) => p.toLowerCase());
  for (const name of wb.SheetNames) {
    if (lowerPreferred.includes(name.trim().toLowerCase())) {
      return wb.Sheets[name];
    }
  }
  return wb.Sheets[wb.SheetNames[0]];
}

export function parseServiceExcel(buffer: ArrayBuffer): {
  headers: string[];
  records: ServiceRecord[];
} {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const ws = pickSheet(wb, ["service_pages", "Community Content"]);
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(
    ws,
    { header: 1, defval: null, raw: false },
  ) as unknown[][];

  if (!rows.length) return { headers: [], records: [] };

  const rawHeaders = (rows[0] ?? []).map((h) => cellStr(h).toUpperCase());
  let headers = [...rawHeaders];
  while (headers.length && headers[headers.length - 1] === "") headers.pop();

  const records: ServiceRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const empty = row.every((c) => cellStr(c) === "");
    if (empty) continue;

    const record: ServiceRecord = { _excel_row: r + 1 };
    headers.forEach((header, i) => {
      if (!header) return;
      record[header] = cellStr(row[i]);
    });

    if (!record.OUTPUT_FILENAME) {
      const slug = cellStr(record.SLUG);
      if (slug) {
        record.OUTPUT_FILENAME = sanitizeFilename(
          slug.toLowerCase().endsWith(".html") ? slug : `${slug}.html`,
        );
      }
    } else {
      record.OUTPUT_FILENAME = sanitizeFilename(record.OUTPUT_FILENAME);
    }
    records.push(record);
  }

  if (!headers.includes("OUTPUT_FILENAME") && records.some((r) => r.OUTPUT_FILENAME)) {
    headers = ["OUTPUT_FILENAME", ...headers.filter((h) => h !== "OUTPUT_FILENAME")];
  }

  return { headers, records };
}

export function parseInternalLinksExcel(buffer: ArrayBuffer): InternalLink[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = pickSheet(wb, ["internal_links"]);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    raw: false,
  }) as unknown[][];

  if (!rows.length) return [];

  const headers = (rows[0] ?? []).map((h) => cellStr(h).toUpperCase());
  const map = Object.fromEntries(headers.map((h, i) => [h, i]));
  for (const req of ["ANCHOR_TEXT", "PAGE_URL", "LINK_PRIORITY"]) {
    if (!(req in map)) {
      throw new Error(`internal_links.xlsx is missing required column: ${req}`);
    }
  }

  const links: InternalLink[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (row.every((c) => cellStr(c) === "")) continue;
    links.push({
      _excel_row: r + 1,
      ANCHOR_TEXT: cellStr(row[map.ANCHOR_TEXT]),
      PAGE_URL: cellStr(row[map.PAGE_URL]),
      LINK_PRIORITY: cellStr(row[map.LINK_PRIORITY]),
    });
  }
  return links;
}

export function parsePriority(value: string): number | null {
  const v = value.trim().toUpperCase();
  if (v === "1" || v === "HIGH" || v === "P1") return 1;
  if (v === "2" || v === "MEDIUM" || v === "P2") return 2;
  if (v === "3" || v === "LOW" || v === "P3") return 3;
  const n = Number(v);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}
