"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  ScanSearch,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";

type TemplateId = "community" | "template1" | "template2";
type NavKey =
  | "dashboard"
  | "template"
  | "excel"
  | "links"
  | "validation"
  | "generate"
  | "reports"
  | "projects"
  | "settings";

type Issue = {
  severity: "error" | "warning";
  error_type: string;
  sheet: string;
  row?: number | string;
  column?: string;
  suggested_fix: string;
};

type ValidateResult = {
  ok: boolean;
  placeholders: string[];
  matched: number;
  missing: string[];
  extra: string[];
  issues: Issue[];
  rowCount: number;
  needsInternalLinks: boolean;
};

type SeoPreview = {
  page_label: string;
  title: string;
  description: string;
  canonical: string;
  og_image: string;
  robots: string;
};

const TEMPLATES: Array<{ id: TemplateId; label: string; description: string }> = [
  {
    id: "community",
    label: "Community Template",
    description: "Q&A community posts — no internal links required",
  },
  {
    id: "template1",
    label: "Template 1 — Standard",
    description: "Service page standard section order",
  },
  {
    id: "template2",
    label: "Template 2 — Shuffled",
    description: "Service page alternate section order",
  },
];

const NAV: Array<{ key: NavKey; label: string; icon: ReactNode }> = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "template", label: "Template", icon: <FileText size={18} /> },
  { key: "excel", label: "Excel", icon: <FileSpreadsheet size={18} /> },
  { key: "links", label: "Internal Links", icon: <Link2 size={18} /> },
  { key: "validation", label: "Validation", icon: <ShieldCheck size={18} /> },
  { key: "generate", label: "Generate", icon: <Wand2 size={18} /> },
  { key: "reports", label: "Reports", icon: <Download size={18} /> },
  { key: "projects", label: "Projects", icon: <FolderKanban size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function filenameFromDisposition(res: Response, fallback: string) {
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/.exec(disposition);
  return match?.[1] || fallback;
}

function FileUploadField({
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

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] shadow-[0_0_0_1px_var(--accent-ring)] transition hover:bg-[var(--accent-light)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState<NavKey>("dashboard");
  const [templateId, setTemplateId] = useState<TemplateId>("community");
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidateResult | null>(null);
  const [seo, setSeo] = useState<SeoPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [productionMode, setProductionMode] = useState(true);
  const [projectName, setProjectName] = useState("Untitled Project");

  const needsLinks = useMemo(() => {
    if (validation) return validation.needsInternalLinks;
    return templateId !== "community";
  }, [templateId, validation]);

  const pushLog = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${stamp}] ${line}`, ...prev].slice(0, 40));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function scanTemplate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Scan failed");
        return;
      }
      const blob = await res.blob();
      const name = filenameFromDisposition(res, "Service Pages.xlsx");
      downloadBlob(blob, name);
      const count = res.headers.get("X-Placeholder-Count") || "?";
      setMessage(`Scanned template → downloaded ${name} (${count} columns)`);
      pushLog(`Scan → ${name} (${count} placeholders)`);
      setPage("excel");
    } catch {
      setError("Network error during scan");
    } finally {
      setBusy(false);
    }
  }

  async function downloadBlankLinks() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/internal-links/blank");
      if (!res.ok) throw new Error("failed");
      downloadBlob(await res.blob(), "internal_links.xlsx");
      setMessage("Downloaded blank internal_links.xlsx");
      pushLog("Created blank internal_links.xlsx");
    } catch {
      setError("Could not download blank links file");
    } finally {
      setBusy(false);
    }
  }

  async function runValidate() {
    if (!serviceFile) {
      setError("Upload service / community Excel first.");
      setPage("excel");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.set("templateId", templateId);
      form.set("serviceExcel", serviceFile);
      if (internalFile) form.set("internalExcel", internalFile);
      const res = await fetch("/api/validate", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Validation failed");
        return;
      }
      setValidation(data as ValidateResult);
      setPage("validation");
      if (data.ok) {
        setMessage(`Ready: ${data.rowCount} row(s), ${data.matched} columns matched.`);
        pushLog(`Validate OK — ${data.rowCount} rows`);
      } else {
        const n = data.issues.filter((i: Issue) => i.severity === "error").length;
        setError(`${n} error(s). Fix Excel or template match.`);
        pushLog(`Validate failed — ${n} errors`);
      }
    } catch {
      setError("Network error during validation");
    } finally {
      setBusy(false);
    }
  }

  async function runSample() {
    if (!serviceFile) {
      setError("Upload Excel first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("templateId", templateId);
      form.set("serviceExcel", serviceFile);
      if (internalFile) form.set("internalExcel", internalFile);
      const res = await fetch("/api/sample", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Sample failed");
        return;
      }
      const name = filenameFromDisposition(res, "sample_preview.html");
      downloadBlob(await res.blob(), name);
      setMessage(`Sample saved: ${name}`);
      pushLog(`Sample → ${name}`);
    } catch {
      setError("Network error during sample");
    } finally {
      setBusy(false);
    }
  }

  async function runSeoPreview() {
    if (!serviceFile) {
      setError("Upload Excel first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("serviceExcel", serviceFile);
      const res = await fetch("/api/seo-preview", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "SEO preview failed");
        return;
      }
      setSeo(data as SeoPreview);
      setPage("generate");
      pushLog(`SEO preview — ${data.page_label}`);
    } catch {
      setError("Network error during SEO preview");
    } finally {
      setBusy(false);
    }
  }

  async function runGenerate() {
    if (!serviceFile) {
      setError("Upload Excel first.");
      return;
    }
    if (validation && !validation.ok) {
      setError("Fix validation errors before generate.");
      setPage("validation");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("Generating ZIP…");
    try {
      const form = new FormData();
      form.set("templateId", templateId);
      form.set("serviceExcel", serviceFile);
      if (internalFile) form.set("internalExcel", internalFile);
      const res = await fetch("/api/generate", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Generation failed");
        setMessage("");
        return;
      }
      const name = filenameFromDisposition(res, "lp-pages.zip");
      downloadBlob(await res.blob(), name);
      const generated = res.headers.get("X-Generated-Count") || "?";
      const failed = res.headers.get("X-Failed-Count") || "0";
      setMessage(`Downloaded ${name} — ${generated} page(s), ${failed} failed.`);
      pushLog(`Generate → ${generated} pages (${failed} failed)`);
      setPage("generate");
    } catch {
      setError("Network error during generate");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  const templateLabel =
    TEMPLATES.find((t) => t.id === templateId)?.label ?? templateId;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--bg-elevated)]/90 px-3 py-5 backdrop-blur-sm">
        <div className="mb-6 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/db_pro_logo.svg"
            alt="The Database Providers"
            className="mb-3 h-9 w-auto max-w-full object-contain object-left"
          />
          <p className="text-[10px] tracking-[0.2em] text-[var(--muted)] uppercase">
            Internal tool
          </p>
          <p
            className="text-2xl text-[var(--text)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            LP Web
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPage(item.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                page === item.key
                  ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_0_24px_rgba(2,54,239,0.35)]"
                  : "text-[var(--muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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
            <SecondaryButton disabled={busy} onClick={scanTemplate}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
              Scan Template
            </SecondaryButton>
            <SecondaryButton disabled={busy} onClick={runValidate}>
              <ShieldCheck size={16} />
              Validate
            </SecondaryButton>
            <PrimaryButton disabled={busy} onClick={runGenerate}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate Everything
            </PrimaryButton>
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-auto p-6">
          {page === "dashboard" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Template", templateLabel],
                  ["Service Excel", serviceFile?.name || "—"],
                  ["Internal Links", needsLinks ? internalFile?.name || "Missing" : "Not required"],
                  ["Validation", validation ? (validation.ok ? "OK" : "Blocked") : "Not run"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[var(--line)] bg-[var(--bg-card)] p-4"
                  >
                    <p className="text-xs text-[var(--muted)]">{label}</p>
                    <p className="mt-1 truncate text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <Card title="Workflow">
                <ol className="space-y-2 text-sm text-[var(--muted)]">
                  <li>1. Template — pick Community / Template 1 / Template 2</li>
                  <li>2. Excel — Scan → download blank sheet, or upload filled file</li>
                  <li>3. Internal Links — only for Template 1 / 2</li>
                  <li>4. Validate → Generate sample or full ZIP</li>
                </ol>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrimaryButton onClick={() => setPage("template")}>
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
          ) : null}

          {page === "template" ? (
            <Card title="Choose master template">
              <p className="mb-4 text-sm text-[var(--muted)]">
                Masters stay read-only. Generation only replaces {"{{PLACEHOLDERS}}"}.
              </p>
              <div className="grid gap-3">
                {TEMPLATES.map((t) => (
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
                      onChange={() => {
                        setTemplateId(t.id);
                        setValidation(null);
                        pushLog(`Selected ${t.label}`);
                      }}
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
                <PrimaryButton disabled={busy} onClick={scanTemplate}>
                  <ScanSearch size={16} />
                  Scan → Download Excel
                </PrimaryButton>
                <SecondaryButton onClick={() => setPage("excel")}>
                  Continue → Excel
                </SecondaryButton>
              </div>
            </Card>
          ) : null}

          {page === "excel" ? (
            <Card title="Service / Community Excel">
              <FileUploadField
                label="Filled Excel"
                hint=".xlsx / .xls — one row per HTML page"
                file={serviceFile}
                required
                onFile={(f) => {
                  setServiceFile(f);
                  setValidation(null);
                  if (f) pushLog(`Excel selected: ${f.name}`);
                }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton disabled={busy} onClick={scanTemplate}>
                  <ScanSearch size={16} />
                  Scan Template → New Excel
                </PrimaryButton>
                <SecondaryButton disabled={busy || !serviceFile} onClick={runValidate}>
                  <ShieldCheck size={16} />
                  Validate
                </SecondaryButton>
              </div>
            </Card>
          ) : null}

          {page === "links" ? (
            <Card title="Internal Links">
              {needsLinks ? (
                <>
                  <p className="mb-4 text-sm text-[var(--muted)]">
                    Required for Template 1 / 2 (`INTERNAL_LINK_*` slots). Columns:
                    ANCHOR_TEXT, PAGE_URL, LINK_PRIORITY.
                  </p>
                  <FileUploadField
                    label="Internal links Excel"
                    hint=".xlsx / .xls"
                    file={internalFile}
                    required
                    onFile={(f) => {
                      setInternalFile(f);
                      if (f) pushLog(`Links selected: ${f.name}`);
                    }}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <SecondaryButton disabled={busy} onClick={downloadBlankLinks}>
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
          ) : null}

          {page === "validation" ? (
            <Card
              title="Validation"
              action={
                <SecondaryButton disabled={busy} onClick={runValidate}>
                  <ShieldCheck size={16} />
                  Re-run
                </SecondaryButton>
              }
            >
              {validation ? (
                <>
                  <div className="mb-4 grid gap-2 sm:grid-cols-4">
                    {[
                      ["Rows", String(validation.rowCount)],
                      ["Matched", String(validation.matched)],
                      ["Missing", String(validation.missing.length)],
                      ["Status", validation.ok ? "OK" : "Blocked"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3"
                      >
                        <p className="text-xs text-[var(--muted)]">{k}</p>
                        <p className="text-lg">{v}</p>
                      </div>
                    ))}
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
          ) : null}

          {page === "generate" ? (
            <div className="space-y-4">
              <Card title="Generate pages">
                <p className="mb-4 text-sm text-[var(--muted)]">
                  Production mode: {productionMode ? "ON (masters locked)" : "OFF"}. Output =
                  ZIP of HTML files (one per Excel row).
                </p>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton disabled={busy} onClick={runGenerate}>
                    <Sparkles size={16} />
                    Generate Everything (ZIP)
                  </PrimaryButton>
                  <SecondaryButton disabled={busy} onClick={runSample}>
                    <FileText size={16} />
                    Generate Sample
                  </SecondaryButton>
                  <SecondaryButton disabled={busy} onClick={runSeoPreview}>
                    <ScanSearch size={16} />
                    SEO Preview
                  </SecondaryButton>
                </div>
              </Card>
              {seo ? (
                <Card title="SEO Preview (row 1)">
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-[var(--muted)]">Page</dt>
                      <dd>{seo.page_label}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Title</dt>
                      <dd>{seo.title || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Description</dt>
                      <dd>{seo.description || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Canonical</dt>
                      <dd className="break-all">{seo.canonical || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Robots</dt>
                      <dd>{seo.robots || "—"}</dd>
                    </div>
                  </dl>
                </Card>
              ) : null}
            </div>
          ) : null}

          {page === "reports" ? (
            <Card title="Reports">
              <p className="mb-4 text-sm text-[var(--muted)]">
                Validation issues live on the Validation page. ZIP packages may include
                `reports/failed.json` when some rows fail.
              </p>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton disabled={busy} onClick={runValidate}>
                  <ShieldCheck size={16} />
                  Run Validation Report
                </SecondaryButton>
                <SecondaryButton disabled={busy} onClick={scanTemplate}>
                  <Download size={16} />
                  Placeholder Excel (via Scan)
                </SecondaryButton>
              </div>
            </Card>
          ) : null}

          {page === "projects" ? (
            <Card title="Project">
              <label className="mb-2 block text-sm text-[var(--muted)]" htmlFor="proj">
                Project name
              </label>
              <input
                id="proj"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mb-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
              />
              <p className="text-sm text-[var(--muted)]">
                Cloud project save/load comes next (Vercel Blob / DB). For now name is
                session-only.
              </p>
            </Card>
          ) : null}

          {page === "settings" ? (
            <Card title="Settings">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={productionMode}
                  onChange={(e) => setProductionMode(e.target.checked)}
                />
                Production Mode (master HTML locked — always enforced server-side)
              </label>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Team password / AUTH_SECRET live in Vercel env vars. Theme + hreflang
                settings planned for a later pass.
              </p>
            </Card>
          ) : null}

          {message ? (
            <p className="flex items-center gap-2 text-sm text-[var(--accent)]" role="status">
              <CheckCircle2 size={16} />
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="flex items-center gap-2 text-sm text-[var(--danger)]" role="alert">
              <AlertTriangle size={16} />
              {error}
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
