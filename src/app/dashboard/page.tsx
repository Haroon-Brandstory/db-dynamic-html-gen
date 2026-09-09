"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useLpWorkflow } from "@/hooks/use-lp-workflow";

export default function DashboardPage() {
  const workflow = useLpWorkflow();
  return <DashboardShell {...workflow} />;
}
