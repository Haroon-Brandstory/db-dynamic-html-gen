"use client";

import { FileText, ScanSearch, Sparkles } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SeoPreview } from "@/lib/types";

export function GeneratePanel({
  productionMode,
  busy,
  seo,
  onGenerate,
  onSample,
  onSeoPreview,
}: {
  productionMode: boolean;
  busy: boolean;
  seo: SeoPreview | null;
  onGenerate: () => void;
  onSample: () => void;
  onSeoPreview: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card title="Generate pages">
        <p className="mb-4 text-sm text-[var(--muted)]">
          Production mode: {productionMode ? "ON (masters locked)" : "OFF"}. Output = ZIP of
          HTML files (one per Excel row).
        </p>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton disabled={busy} onClick={onGenerate}>
            <Sparkles size={16} />
            Generate Everything (ZIP)
          </PrimaryButton>
          <SecondaryButton disabled={busy} onClick={onSample}>
            <FileText size={16} />
            Generate Sample
          </SecondaryButton>
          <SecondaryButton disabled={busy} onClick={onSeoPreview}>
            <ScanSearch size={16} />
            SEO Preview
          </SecondaryButton>
        </div>
      </Card>
      {seo ? (
        <Card title="SEO Preview (row 1)">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Page</dt>
              <dd>{seo.page_label}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Title</dt>
              <dd>{seo.title || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Description</dt>
              <dd>{seo.description || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Canonical</dt>
              <dd className="break-all">{seo.canonical || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Robots</dt>
              <dd>{seo.robots || "—"}</dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
