"use client";

import { Download } from "lucide-react";
import { SecondaryButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUploadField } from "@/components/ui/file-upload-field";

export function LinksPanel({
  needsLinks,
  internalFile,
  busy,
  onFile,
  onDownloadBlank,
}: {
  needsLinks: boolean;
  internalFile: File | null;
  busy: boolean;
  onFile: (file: File | null) => void;
  onDownloadBlank: () => void;
}) {
  return (
    <Card title="Internal Links">
      {needsLinks ? (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Required for Template 1 / 2 (`INTERNAL_LINK_*` slots). Columns: ANCHOR_TEXT,
            PAGE_URL, LINK_PRIORITY.
          </p>
          <FileUploadField
            label="Internal links Excel"
            hint=".xlsx / .xls"
            file={internalFile}
            required
            onFile={onFile}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <SecondaryButton disabled={busy} onClick={onDownloadBlank}>
              <Download size={16} />
              Create Sample File
            </SecondaryButton>
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Current template does not use internal links. Skip this step.
        </p>
      )}
    </Card>
  );
}
