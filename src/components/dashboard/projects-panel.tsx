"use client";

import { Card } from "@/components/ui/card";

export function ProjectsPanel({
  projectName,
  onChange,
}: {
  projectName: string;
  onChange: (name: string) => void;
}) {
  return (
    <Card title="Project">
      <label className="mb-2 block text-sm text-[var(--muted)]" htmlFor="proj">
        Project name
      </label>
      <input
        id="proj"
        value={projectName}
        onChange={(e) => onChange(e.target.value)}
        className="mb-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
      />
      <p className="text-sm text-[var(--muted)]">
        Cloud project save/load comes next (Vercel Blob / DB). For now name is session-only.
      </p>
    </Card>
  );
}
