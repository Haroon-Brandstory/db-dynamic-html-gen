import * as XLSX from "xlsx";
import { isAutoColumn } from "./placeholders";

export function buildServiceWorkbookBuffer(
  columns: string[],
  sheetName = "service_pages",
): ArrayBuffer {
  const content = columns.filter((c) => !isAutoColumn(c));
  const header = ["OUTPUT_FILENAME", ...content.filter((c) => c !== "OUTPUT_FILENAME")];

  const sample = header.map((col) =>
    col === "OUTPUT_FILENAME" ? "sample-page.html" : "",
  );

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, sample]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const guideHeader = ["HTML Placeholder", "Excel Column", "Notes"];
  const guideRows = header.map((col) => [`{{${col}}}`, col, "Fill per page row"]);
  const guide = XLSX.utils.aoa_to_sheet([guideHeader, ...guideRows]);
  XLSX.utils.book_append_sheet(wb, guide, "Placeholder_Guide");

  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function buildInternalLinksWorkbookBuffer(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["ANCHOR_TEXT", "PAGE_URL", "LINK_PRIORITY"],
    ["Example Anchor", "https://www.thedatabaseproviders.com/example/", "1"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "internal_links");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
