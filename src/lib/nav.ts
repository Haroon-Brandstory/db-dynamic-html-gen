import type { LucideIcon } from "lucide-react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Link2,
  Settings,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import type { NavKey } from "@/lib/types";

export type NavItem = {
  key: NavKey;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "template", label: "Template", icon: FileText },
  { key: "excel", label: "Excel", icon: FileSpreadsheet },
  { key: "links", label: "Internal Links", icon: Link2 },
  { key: "validation", label: "Validation", icon: ShieldCheck },
  { key: "generate", label: "Generate", icon: Wand2 },
  { key: "reports", label: "Reports", icon: Download },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "settings", label: "Settings", icon: Settings },
];
