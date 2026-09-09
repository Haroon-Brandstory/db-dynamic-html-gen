import { readFile } from "fs/promises";
import path from "path";

export type TemplateId = "community" | "template1" | "template2";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  filename: string;
  description: string;
};

export const BUNDLED_TEMPLATES: TemplateMeta[] = [
  {
    id: "community",
    label: "Community Template",
    filename: "Community Template.html",
    description: "Question + answers community page",
  },
  {
    id: "template1",
    label: "Template 1 — Standard Layout",
    filename: "Database Provider Service Page.html",
    description:
      "Hero → Access → Instant → Video → Reach Us → ROI → Purchase → Links → Why → FAQ → Contact",
  },
  {
    id: "template2",
    label: "Template 2 — Shuffled Layout",
    filename: "Database Provider Service Page Template 2.html",
    description:
      "Hero → Access → Instant → Video → ROI → Purchase → Reach Us → Why → Links → FAQ → Contact",
  },
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return BUNDLED_TEMPLATES.find((t) => t.id === id);
}

export function templatesDir(): string {
  return path.join(process.cwd(), "templates");
}

export async function loadTemplateHtml(id: TemplateId): Promise<string> {
  const meta = getTemplateMeta(id);
  if (!meta) throw new Error(`Unknown template: ${id}`);
  const filePath = path.join(templatesDir(), meta.filename);
  return readFile(filePath, "utf8");
}
