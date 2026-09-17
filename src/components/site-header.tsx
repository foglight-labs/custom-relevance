import Image from "next/image";
import { Star } from "lucide-react";
import { REPO_URL, formatStars, getStarCount } from "@/lib/github";

export async function SiteHeader() {
  const stars = await getStarCount();

  return (
    <header className="flex h-[52px] items-center justify-between border-b border-hairline bg-page px-8">
      <a
        href="https://foglight.co"
        className="inline-flex items-center gap-2.5 text-main transition-opacity hover:opacity-70"
      >
        <Image src="/foglight.svg" alt="Foglight" width={22} height={22} className="rounded-[5px]" />
        <span className="text-[14px] font-semibold tracking-tight">Custom Relevance</span>
      </a>

      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-[34px] items-center gap-2 rounded-lg border border-hairline bg-panel px-3 text-[13.5px] font-medium text-main transition-colors hover:border-[#d8d2c7] hover:bg-soft"
        aria-label={stars === null ? "GitHub repository" : `GitHub repository, ${stars} stars`}
      >
        <GithubMark />
        <span>GitHub</span>
        {stars !== null && (
          <span className="inline-flex items-center gap-1 text-muted tabular-nums">
            <Star className="size-3.5" />
            {formatStars(stars)}
          </span>
        )}
      </a>
    </header>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-3.03 0-.62.22-1.15.58-1.56-.05-.15-.25-.75.05-1.55 0 0 .57-.18 1.86.7a6.3 6.3 0 0 1 1.7-.23c.58 0 1.16.08 1.7.23 1.29-.88 1.86-.7 1.86-.7.3.8.1 1.4.05 1.55.36.41.58.94.58 1.56 0 2.16-1.14 2.83-2.92 3.03.37.32.7.95.7 1.92 0 1.09-.01 1.98-.01 2.25 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
