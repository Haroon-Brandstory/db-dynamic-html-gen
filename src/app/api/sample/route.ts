import { NextResponse } from "next/server";
import { parseInternalLinksExcel, parseServiceExcel } from "@/lib/excel";
import { generatePageHtml, validateCoverage } from "@/lib/generate";
import { needsInternalLinks, scanPlaceholders } from "@/lib/placeholders";
import { loadTemplateHtml, type TemplateId } from "@/lib/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const templateId = String(form.get("templateId") ?? "") as TemplateId;
    const serviceFile = form.get("serviceExcel");
    const internalFile = form.get("internalExcel");

    if (!templateId || !(serviceFile instanceof File)) {
      return NextResponse.json({ error: "templateId + serviceExcel required" }, { status: 400 });
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

    if (!coverage.ok || !records.length) {
      return NextResponse.json(
        {
          error: "Validation failed — cannot build sample",
          issues: coverage.issues.filter((i) => i.severity === "error"),
        },
        { status: 400 },
      );
    }

    const { filename, html } = generatePageHtml(
      masterHtml,
      placeholders,
      records[0],
      links,
    );

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="sample-${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sample failed" },
      { status: 500 },
    );
  }
}
