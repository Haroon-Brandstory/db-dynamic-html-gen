import type { TemplateId } from "@/lib/types";

export type CatalogTemplate = {
  id: TemplateId;
  label: string;
  description: string;
};

/** Client-safe template picker copy (masters live under templates/). */
export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: "community",
    label: "Community Template",
    description: "Q&A community posts — no internal links required",
  },
  {
    id: "template1",
    label: "Template 1 — Standard",
    description: "Service page standard section order",
  },
  {
    id: "template2",
    label: "Template 2 — Shuffled",
    description: "Service page alternate section order",
  },
];

export function catalogLabel(id: TemplateId): string {
  return CATALOG_TEMPLATES.find((t) => t.id === id)?.label ?? id;
}
