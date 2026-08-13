/**
 * Utility helper for normalizing and retrieving the public anonymous student submission URL (/ask).
 * Reads NEXT_PUBLIC_APP_URL and guarantees clean trailing slash normalization.
 */
export function getAskUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_APP_URL configured: "${rawUrl}". Must be a valid HTTP or HTTPS URL.`
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid NEXT_PUBLIC_APP_URL protocol: "${parsed.protocol}". Protocol must be http: or https:.`
    );
  }

  const baseUrl = rawUrl.replace(/\/$/, "");
  return `${baseUrl}/ask`;
}
