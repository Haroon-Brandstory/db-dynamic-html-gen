import JSZip from "jszip";
import { NextResponse } from "next/server";
import { parseInternalLinksExcel, parseServiceExcel } from "@/lib/excel";
import { generatePageHtml, validateCoverage } from "@/lib/generate";
import { needsInternalLinks, scanPlaceholders } from "@/lib/placeholders";
import { loadTemplateHtml, type TemplateId } from "@/lib/templates";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const templateId = String(form.get("templateId") ?? "") as TemplateId;
    const serviceFile = form.get("serviceExcel");
    const internalFile = form.get("internalExcel");

    if (!templateId) {
      return NextResponse.json({ error: "templateId required" }, { status: 400 });
    }
    if (!(serviceFile instanceof File)) {
      return NextResponse.json({ error: "serviceExcel file required" }, { status: 400 });
    }

    const masterHtml = await loadTemplateHtml(templateId);
    const placeholders = scanPlaceholders(masterHtml);
    const { headers, records } = parseServiceExcel(await serviceFile.arrayBuffer());
    const coverage = validateCoverage(placeholders, headers, records);

    let links = [] as ReturnType<typeof parseInternalLinksExcel>;
    if (needsInternalLinks(placeholders)) {
      if (!(internalFile instanceof File)) {
        return NextResponse.json(
          { error: "Internal links Excel required for this template" },
          { status: 400 },
        );
      }
      links = parseInternalLinksExcel(await internalFile.arrayBuffer());
    }

    if (!coverage.ok) {
      return NextResponse.json(
        { error: "Validation failed", issues: coverage.issues.filter((i) => i.severity === "error") },
        { status: 400 },
      );
    }

    const maxRows = Number(process.env.MAX_GENERATE_ROWS ?? 800);
    if (records.length > maxRows) {
      return NextResponse.json(
        { error: `Too many rows (${records.length}). Max ${maxRows} per run on Vercel.` },
        { status: 400 },
      );
    }

    const zip = new JSZip();
    const failed: Array<{ row: number; reason: string }> = [];

    for (const record of records) {
      try {
        const { filename, html } = generatePageHtml(
          masterHtml,
          placeholders,
          record,
          links,
        );
        zip.file(filename, html);
      } catch (err) {
        failed.push({
          row: record._excel_row,
          reason: err instanceof Error ? err.message : "Generate failed",
        });
      }
    }

    if (failed.length && failed.length === records.length) {
      return NextResponse.json({ error: "All rows failed", failed }, { status: 500 });
    }

    if (failed.length) {
      zip.file(
        "reports/failed.json",
        JSON.stringify({ failed }, null, 2),
      );
    }

    const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="lp-pages-${templateId}-${stamp}.zip"`,
        "X-Generated-Count": String(records.length - failed.length),
        "X-Failed-Count": String(failed.length),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
