"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PrimaryButton } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <BrandLogo heightClass="h-10" className="mb-6 max-w-[240px]" />
      <p className="mb-2 text-sm tracking-[0.2em] text-[var(--muted)] uppercase">
        Internal access
      </p>
      <h1
        className="mb-3 text-4xl text-[var(--text)]"
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        LP Generator
      </h1>
      <p className="mb-8 text-[var(--muted)]">
        Internal team access. Excel in → HTML pages out.
      </p>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)]/90 p-6 shadow-[0_0_0_1px_rgba(2,54,239,0.25),0_24px_80px_rgba(0,20,68,0.55)] backdrop-blur-sm"
      >
        <label
          className="mb-2 flex items-center gap-2 text-sm text-[var(--muted)]"
          htmlFor="password"
        >
          <KeyRound size={16} />
          Team password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
          required
        />
        {error ? (
          <p className="mb-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={busy} className="w-full py-2.5">
          {busy ? <Loader2 size={18} className="animate-spin" /> : null}
          {busy ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
    </main>
  );
}
