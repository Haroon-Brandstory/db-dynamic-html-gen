import { NextResponse } from "next/server";
import { parseServiceExcel } from "@/lib/excel";

export const runtime = "nodejs";

/** Lightweight SEO preview from first Excel row. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const serviceFile = form.get("serviceExcel");
    if (!(serviceFile instanceof File)) {
      return NextResponse.json({ error: "serviceExcel required" }, { status: 400 });
    }
    const { records } = parseServiceExcel(await serviceFile.arrayBuffer());
    if (!records.length) {
      return NextResponse.json({ error: "No data rows" }, { status: 400 });
    }
    const r = records[0];
    return NextResponse.json({
      page_label: String(r.OUTPUT_FILENAME || r.META_TITLE || `Row ${r._excel_row}`),
      title: String(r.META_TITLE || r.OG_TITLE || ""),
      description: String(r.META_DESCRIPTION || r.OG_DESCRIPTION || ""),
      canonical: String(r.CANONICAL_URL || r.OG_URL || ""),
      og_image: String(r.OG_IMAGE || ""),
      robots: String(r.ROBOTS || ""),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "SEO preview failed" },
      { status: 500 },
    );
  }
}
