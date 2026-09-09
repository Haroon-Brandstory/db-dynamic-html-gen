"use client";

import { PrimaryButton } from "@/components/ui/button";
import { Card, StatTile } from "@/components/ui/card";
import type { NavKey } from "@/lib/types";

export function OverviewPanel({
  templateLabel,
  serviceName,
  linksValue,
  validationLabel,
  log,
  onStart,
}: {
  templateLabel: string;
  serviceName: string;
  linksValue: string;
  validationLabel: string;
  log: string[];
  onStart: (page: NavKey) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Template" value={templateLabel} />
        <StatTile label="Service Excel" value={serviceName} />
        <StatTile label="Internal Links" value={linksValue} />
        <StatTile label="Validation" value={validationLabel} />
      </div>
      <Card title="Workflow">
        <ol className="space-y-2 text-sm text-[var(--muted)]">
          <li>1. Template — pick Community / Template 1 / Template 2</li>
          <li>2. Excel — Scan → download blank sheet, or upload filled file</li>
          <li>3. Internal Links — only for Template 1 / 2</li>
          <li>4. Validate → Generate sample or full ZIP</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton onClick={() => onStart("template")}>
            Start with Template
          </PrimaryButton>
        </div>
      </Card>
      <Card title="Activity">
        {log.length ? (
          <ul className="max-h-48 space-y-1 overflow-auto font-mono text-xs text-[var(--muted)]">
            {log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">No activity yet.</p>
        )}
      </Card>
    </>
  );
}
