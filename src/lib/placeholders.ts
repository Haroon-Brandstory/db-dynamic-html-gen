export const PLACEHOLDER_RE = /\{\{([A-Z0-9_]+)\}\}/g;

export const AUTO_PREFIXES = ["INTERNAL_LINK_", "HREFLANG_"] as const;
export const SYSTEM_COLUMNS = ["OUTPUT_FILENAME"] as const;

export function isAutoColumn(name: string): boolean {
  return AUTO_PREFIXES.some((p) => name.startsWith(p));
}

export function needsInternalLinks(columns: string[]): boolean {
  return columns.some((c) => c.startsWith("INTERNAL_LINK_"));
}

export function scanPlaceholders(html: string): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const re = new RegExp(PLACEHOLDER_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

export function replacePlaceholders(
  html: string,
  values: Record<string, string>,
): string {
  return html.replace(PLACEHOLDER_RE, (_full, name: string) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      return values[name] ?? "";
    }
    return "";
  });
}

export function remainingPlaceholders(html: string): string[] {
  const found: string[] = [];
  const re = new RegExp(PLACEHOLDER_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    found.push(match[1]);
  }
  return found;
}

export function sanitizeFilename(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  let name = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, "-");
  name = name.replace(/\s+/g, "-");
  if (!name.toLowerCase().endsWith(".html") && !name.toLowerCase().endsWith(".htm")) {
    name = `${name}.html`;
  }
  return name;
}
