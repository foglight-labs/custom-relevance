const REPO = "foglight-labs/custom-relevance";

export const REPO_URL = `https://github.com/${REPO}`;

/**
 * Star count for this repo, or null when GitHub can't be reached (its
 * unauthenticated API is rate limited per IP, so the header has to render
 * without a count). Revalidated hourly, which keeps one request per hour
 * regardless of traffic.
 */
export async function getStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { stargazers_count?: unknown };
    return typeof json.stargazers_count === "number" ? json.stargazers_count : null;
  } catch {
    return null;
  }
}

export function formatStars(count: number): string {
  if (count < 1000) return String(count);
  const thousands = count / 1000;
  return `${thousands < 10 ? thousands.toFixed(1) : Math.round(thousands)}k`;
}
