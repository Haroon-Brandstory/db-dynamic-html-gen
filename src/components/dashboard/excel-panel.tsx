"use client";

import { ScanSearch, ShieldCheck } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUploadField } from "@/components/ui/file-upload-field";

export function ExcelPanel({
  serviceFile,
  busy,
  onFile,
  onScan,
  onValidate,
}: {
  serviceFile: File | null;
  busy: boolean;
  onFile: (file: File | null) => void;
  onScan: () => void;
  onValidate: () => void;
}) {
  return (
    <Card title="Service / Community Excel">
      <FileUploadField
        label="Filled Excel"
        hint=".xlsx / .xls — one row per HTML page"
        file={serviceFile}
        required
        onFile={onFile}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton disabled={busy} onClick={onScan}>
          <ScanSearch size={16} />
          Scan Template → New Excel
        </PrimaryButton>
        <SecondaryButton disabled={busy || !serviceFile} onClick={onValidate}>
          <ShieldCheck size={16} />
          Validate
        </SecondaryButton>
      </div>
    </Card>
  );
}
