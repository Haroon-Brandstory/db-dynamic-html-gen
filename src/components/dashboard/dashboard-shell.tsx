"use client";

import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { TemplatePanel } from "@/components/dashboard/template-panel";
import { ExcelPanel } from "@/components/dashboard/excel-panel";
import { LinksPanel } from "@/components/dashboard/links-panel";
import { ValidationPanel } from "@/components/dashboard/validation-panel";
import { GeneratePanel } from "@/components/dashboard/generate-panel";
import { ReportsPanel } from "@/components/dashboard/reports-panel";
import { ProjectsPanel } from "@/components/dashboard/projects-panel";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { StatusBanner } from "@/components/ui/status-banner";
import type { LpWorkflow } from "@/hooks/use-lp-workflow";

export function DashboardShell(w: LpWorkflow) {
  const linksValue = w.needsLinks
    ? w.internalFile?.name || "Missing"
    : "Not required";
  const validationLabel = w.validation
    ? w.validation.ok
      ? "OK"
      : "Blocked"
    : "Not run";

  return (
    <div className="flex min-h-screen">
      <AppSidebar page={w.page} onNavigate={w.setPage} onLogout={w.logout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          page={w.page}
          projectName={w.projectName}
          templateLabel={w.templateLabel}
          busy={w.busy}
          onScan={w.scanTemplate}
          onValidate={w.runValidate}
          onGenerate={w.runGenerate}
        />

        <main className="flex-1 space-y-4 overflow-auto p-6">
          {w.page === "dashboard" ? (
            <OverviewPanel
              templateLabel={w.templateLabel}
              serviceName={w.serviceFile?.name || "—"}
              linksValue={linksValue}
              validationLabel={validationLabel}
              log={w.log}
              onStart={w.setPage}
            />
          ) : null}

          {w.page === "template" ? (
            <TemplatePanel
              templateId={w.templateId}
              busy={w.busy}
              onSelect={w.selectTemplate}
              onScan={w.scanTemplate}
              onContinue={() => w.setPage("excel")}
            />
          ) : null}

          {w.page === "excel" ? (
            <ExcelPanel
              serviceFile={w.serviceFile}
              busy={w.busy}
              onFile={w.setServiceExcel}
              onScan={w.scanTemplate}
              onValidate={w.runValidate}
            />
          ) : null}

          {w.page === "links" ? (
            <LinksPanel
              needsLinks={w.needsLinks}
              internalFile={w.internalFile}
              busy={w.busy}
              onFile={w.setInternalExcel}
              onDownloadBlank={w.downloadBlankLinks}
            />
          ) : null}

          {w.page === "validation" ? (
            <ValidationPanel
              validation={w.validation}
              busy={w.busy}
              onRerun={w.runValidate}
            />
          ) : null}

          {w.page === "generate" ? (
            <GeneratePanel
              productionMode={w.productionMode}
              busy={w.busy}
              seo={w.seo}
              onGenerate={w.runGenerate}
              onSample={w.runSample}
              onSeoPreview={w.runSeoPreview}
            />
          ) : null}

          {w.page === "reports" ? (
            <ReportsPanel
              busy={w.busy}
              onValidate={w.runValidate}
              onScan={w.scanTemplate}
            />
          ) : null}

          {w.page === "projects" ? (
            <ProjectsPanel projectName={w.projectName} onChange={w.setProjectName} />
          ) : null}

          {w.page === "settings" ? (
            <SettingsPanel
              productionMode={w.productionMode}
              onChange={w.setProductionMode}
            />
          ) : null}

          <StatusBanner message={w.message} error={w.error} />
        </main>
      </div>
    </div>
  );
}
