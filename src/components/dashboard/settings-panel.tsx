"use client";

import { Card } from "@/components/ui/card";

export function SettingsPanel({
  productionMode,
  onChange,
}: {
  productionMode: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <Card title="Settings">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={productionMode}
          onChange={(e) => onChange(e.target.checked)}
        />
        Production Mode (master HTML locked — always enforced server-side)
      </label>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Team password / AUTH_SECRET live in Vercel env vars. Theme + hreflang settings planned
        for a later pass.
      </p>
    </Card>
  );
}
