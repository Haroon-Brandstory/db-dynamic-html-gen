"use client";

import { Loader2, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import type { NavKey } from "@/lib/types";

export function AppHeader({
  page,
  projectName,
  templateLabel,
  busy,
  onScan,
  onValidate,
  onGenerate,
}: {
  page: NavKey;
  projectName: string;
  templateLabel: string;
  busy: boolean;
  onScan: () => void;
  onValidate: () => void;
  onGenerate: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/40 px-6 py-4 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-medium capitalize text-[var(--text)]">
          {page.replace("-", " ")}
        </h1>
        <p className="text-xs text-[var(--muted)]">
          {projectName} · {templateLabel}
          {busy ? " · Working…" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton disabled={busy} onClick={onScan}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
          Scan Template
        </SecondaryButton>
        <SecondaryButton disabled={busy} onClick={onValidate}>
          <ShieldCheck size={16} />
          Validate
        </SecondaryButton>
        <PrimaryButton disabled={busy} onClick={onGenerate}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate Everything
        </PrimaryButton>
      </div>
    </header>
  );
}
