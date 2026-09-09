"use client";

import { Download, ShieldCheck } from "lucide-react";
import { SecondaryButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ReportsPanel({
  busy,
  onValidate,
  onScan,
}: {
  busy: boolean;
  onValidate: () => void;
  onScan: () => void;
}) {
  return (
    <Card title="Reports">
      <p className="mb-4 text-sm text-[var(--muted)]">
        Validation issues live on the Validation page. ZIP packages may include
        `reports/failed.json` when some rows fail.
      </p>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton disabled={busy} onClick={onValidate}>
          <ShieldCheck size={16} />
          Run Validation Report
        </SecondaryButton>
        <SecondaryButton disabled={busy} onClick={onScan}>
          <Download size={16} />
          Placeholder Excel (via Scan)
        </SecondaryButton>
      </div>
    </Card>
  );
}
