"use client";

import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { NAV_ITEMS } from "@/lib/nav";
import type { NavKey } from "@/lib/types";

export function AppSidebar({
  page,
  onNavigate,
  onLogout,
}: {
  page: NavKey;
  onNavigate: (key: NavKey) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--bg-elevated)]/90 px-3 py-5 backdrop-blur-sm">
      <div className="mb-6 px-2">
        <BrandLogo className="mb-3" />
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
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                active
                  ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_0_24px_rgba(2,54,239,0.35)]"
                  : "text-[var(--muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
