"use client";

import { ScanSearch } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATALOG_TEMPLATES } from "@/lib/catalog";
import type { TemplateId } from "@/lib/types";

export function TemplatePanel({
  templateId,
  busy,
  onSelect,
  onScan,
  onContinue,
}: {
  templateId: TemplateId;
  busy: boolean;
  onSelect: (id: TemplateId) => void;
  onScan: () => void;
  onContinue: () => void;
}) {
  return (
    <Card title="Choose master template">
      <p className="mb-4 text-sm text-[var(--muted)]">
        Masters stay read-only. Generation only replaces {"{{PLACEHOLDERS}}"}.
      </p>
      <div className="grid gap-3">
        {CATALOG_TEMPLATES.map((t) => (
          <label
            key={t.id}
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
              templateId === t.id
                ? "border-[var(--accent)] bg-[var(--bg-elevated)]"
                : "border-[var(--line)]"
            }`}
          >
            <input
              type="radio"
              name="template"
              checked={templateId === t.id}
              onChange={() => onSelect(t.id)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">{t.label}</span>
              <span className="text-sm text-[var(--muted)]">{t.description}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton disabled={busy} onClick={onScan}>
          <ScanSearch size={16} />
          Scan → Download Excel
        </PrimaryButton>
        <SecondaryButton onClick={onContinue}>Continue → Excel</SecondaryButton>
      </div>
    </Card>
  );
}
