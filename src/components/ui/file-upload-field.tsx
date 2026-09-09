"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";

export function FileUploadField({
  label,
  hint,
  file,
  required,
  onFile,
}: {
  label: string;
  hint: string;
  file: File | null;
  required?: boolean;
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function takeFile(next: File | null) {
    if (next && !/\.xlsx?$/i.test(next.name)) return;
    onFile(next);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    takeFile(e.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div>
      <p className="mb-2 text-sm text-[var(--muted)]">
        {label}
        {required ? <span className="text-[var(--accent)]"> *</span> : null}
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging
            ? "border-[var(--accent)] bg-[var(--bg-elevated)]"
            : file
              ? "border-[var(--accent-light)] bg-[var(--bg-elevated)]"
              : "border-[var(--line)] hover:border-[var(--accent-light)] hover:bg-[var(--bg-elevated)]"
        }`}
      >
        <UploadCloud
          size={36}
          strokeWidth={1.5}
          className={file ? "text-[var(--accent)]" : "text-[var(--muted)]"}
        />
        {file ? (
          <>
            <p className="text-sm font-medium text-[var(--accent)]">{file.name}</p>
            <p className="text-xs text-[var(--muted)]">
              {(file.size / 1024).toFixed(1)} KB · click or drop to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--text)]">
              Drop Excel here or click to browse
            </p>
            <p className="text-xs text-[var(--muted)]">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={(e) => {
            takeFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
