import { NextResponse } from "next/server";
import { parseInternalLinksExcel, parseServiceExcel } from "@/lib/excel";
import { validateCoverage } from "@/lib/generate";
import { needsInternalLinks, scanPlaceholders } from "@/lib/placeholders";
import { loadTemplateHtml, type TemplateId } from "@/lib/templates";

export const runtime = "nodejs";

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
    const serviceBuf = await serviceFile.arrayBuffer();
    const { headers, records } = parseServiceExcel(serviceBuf);

    const result = validateCoverage(placeholders, headers, records);

    if (needsInternalLinks(placeholders)) {
      if (!(internalFile instanceof File)) {
        result.ok = false;
        result.issues.unshift({
          severity: "error",
          error_type: "Missing Internal Links Excel",
          sheet: "Application",
          suggested_fix: "Upload internal_links.xlsx (required for this template)",
        });
      } else {
        try {
          const links = parseInternalLinksExcel(await internalFile.arrayBuffer());
          if (!links.length) {
            result.ok = false;
            result.issues.push({
              severity: "error",
              error_type: "Empty Internal Links",
              sheet: "internal_links",
              suggested_fix: "Add at least one internal link row",
            });
          }
        } catch (err) {
          result.ok = false;
          result.issues.push({
            severity: "error",
            error_type: "Internal Links Parse Error",
            sheet: "internal_links",
            suggested_fix: err instanceof Error ? err.message : "Invalid links Excel",
          });
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 500 },
    );
  }
}
