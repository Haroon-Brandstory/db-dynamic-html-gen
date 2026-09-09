import { NextResponse } from "next/server";
import { buildServiceWorkbookBuffer } from "@/lib/excel-write";
import { isAutoColumn, scanPlaceholders } from "@/lib/placeholders";
import { loadTemplateHtml, type TemplateId } from "@/lib/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { templateId?: TemplateId };
    const templateId = body.templateId;
    if (!templateId) {
      return NextResponse.json({ error: "templateId required" }, { status: 400 });
    }

    const html = await loadTemplateHtml(templateId);
    const columns = scanPlaceholders(html).filter((c) => !isAutoColumn(c));
    const sheetName = templateId === "community" ? "Community Content" : "service_pages";
    const buffer = buildServiceWorkbookBuffer(
      ["OUTPUT_FILENAME", ...columns],
      sheetName,
    );

    const name =
      templateId === "community"
        ? "Community Pages.xlsx"
        : "Database Provider Service Pages.xlsx";

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${name}"`,
        "X-Placeholder-Count": String(columns.length),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 },
    );
  }
}
