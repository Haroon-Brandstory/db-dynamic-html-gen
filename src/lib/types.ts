export type TemplateId = "community" | "template1" | "template2";

export type NavKey =
  | "dashboard"
  | "template"
  | "excel"
  | "links"
  | "validation"
  | "generate"
  | "reports"
  | "projects"
  | "settings";

export type Issue = {
  severity: "error" | "warning";
  error_type: string;
  sheet: string;
  row?: number | string;
  column?: string;
  suggested_fix: string;
};

export type ValidateResult = {
  ok: boolean;
  placeholders: string[];
  matched: number;
  missing: string[];
  extra: string[];
  issues: Issue[];
  rowCount: number;
  needsInternalLinks: boolean;
};

export type SeoPreview = {
  page_label: string;
  title: string;
  description: string;
  canonical: string;
  og_image: string;
  robots: string;
};
