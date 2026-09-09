"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { SecondaryButton } from "@/components/ui/button";
import { Card, MetricTile } from "@/components/ui/card";
import type { ValidateResult } from "@/lib/types";

export function ValidationPanel({
  validation,
  busy,
  onRerun,
}: {
  validation: ValidateResult | null;
  busy: boolean;
  onRerun: () => void;
}) {
  return (
    <Card
      title="Validation"
      action={
        <SecondaryButton disabled={busy} onClick={onRerun}>
          <ShieldCheck size={16} />
          Re-run
        </SecondaryButton>
      }
    >
      {validation ? (
        <>
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            <MetricTile label="Rows" value={String(validation.rowCount)} />
            <MetricTile label="Matched" value={String(validation.matched)} />
            <MetricTile label="Missing" value={String(validation.missing.length)} />
            <MetricTile label="Status" value={validation.ok ? "OK" : "Blocked"} />
          </div>
          {validation.ok ? (
            <p className="mb-3 flex items-center gap-2 text-sm text-[var(--accent)]">
              <CheckCircle2 size={16} /> Ready to generate
            </p>
          ) : (
            <p className="mb-3 flex items-center gap-2 text-sm text-[var(--danger)]">
              <AlertTriangle size={16} /> Fix errors before generate
            </p>
          )}
          {validation.issues.length ? (
            <div className="max-h-72 overflow-auto rounded-xl border border-[var(--line)]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[var(--bg-elevated)] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Column</th>
                    <th className="px-3 py-2">Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.issues.slice(0, 100).map((issue, idx) => (
                    <tr key={idx} className="border-t border-[var(--line)]">
                      <td className="px-3 py-2">{issue.severity}</td>
                      <td className="px-3 py-2">{issue.error_type}</td>
                      <td className="px-3 py-2">
                        {issue.column || "—"}
                        {issue.row != null ? ` / row ${issue.row}` : ""}
                      </td>
                      <td className="px-3 py-2 text-[var(--muted)]">
                        {issue.suggested_fix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Upload Excel, then run Validate from the toolbar.
        </p>
      )}
    </Card>
  );
}
