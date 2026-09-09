import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function StatusBanner({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  return (
    <>
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
    </>
  );
}
