"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { catalogLabel } from "@/lib/catalog";
import { downloadBlob, filenameFromDisposition } from "@/lib/download";
import type {
  Issue,
  NavKey,
  SeoPreview,
  TemplateId,
  ValidateResult,
} from "@/lib/types";

export function useLpWorkflow() {
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

  const templateLabel = catalogLabel(templateId);

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

  function selectTemplate(id: TemplateId) {
    setTemplateId(id);
    setValidation(null);
    pushLog(`Selected ${catalogLabel(id)}`);
  }

  function setServiceExcel(file: File | null) {
    setServiceFile(file);
    setValidation(null);
    if (file) pushLog(`Excel selected: ${file.name}`);
  }

  function setInternalExcel(file: File | null) {
    setInternalFile(file);
    if (file) pushLog(`Links selected: ${file.name}`);
  }

  return {
    page,
    setPage,
    templateId,
    templateLabel,
    serviceFile,
    internalFile,
    validation,
    seo,
    busy,
    message,
    error,
    log,
    productionMode,
    setProductionMode,
    projectName,
    setProjectName,
    needsLinks,
    pushLog,
    logout,
    scanTemplate,
    downloadBlankLinks,
    runValidate,
    runSample,
    runSeoPreview,
    runGenerate,
    selectTemplate,
    setServiceExcel,
    setInternalExcel,
  };
}

export type LpWorkflow = ReturnType<typeof useLpWorkflow>;
