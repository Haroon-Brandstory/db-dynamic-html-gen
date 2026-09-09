import { NextResponse } from "next/server";
import { buildInternalLinksWorkbookBuffer } from "@/lib/excel-write";

export const runtime = "nodejs";

export async function GET() {
  const buffer = buildInternalLinksWorkbookBuffer();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="internal_links.xlsx"',
    },
  });
}
