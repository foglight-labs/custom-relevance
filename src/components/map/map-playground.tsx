"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapFactorBar } from "@/components/map/map-factor-bar";
import { MapLegend } from "@/components/map/map-legend";
import { RankedList, type RankedCountry } from "@/components/map/ranked-list";
import { WorldMap } from "@/components/map/world-map";
import { useMapScore } from "@/hooks/use-map-score";
import { clampText, MAX_FACTOR_TEXT_LENGTH } from "@/lib/limits";
import { relativeColorScale } from "@/lib/map/color";
import { COUNTRIES } from "@/lib/map/countries";
import { cn } from "@/lib/utils";

/** Reads the factor from `?factor=`, which is what makes a map shareable. */
export function MapPlaygroundFromUrl() {
  const searchParams = useSearchParams();
  const factor = clampText(searchParams.get("factor") ?? "", MAX_FACTOR_TEXT_LENGTH);
  return <MapPlayground factor={factor} />;
}

export function MapPlayground({ factor }: { factor: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, scores, error, code, retry } = useMapScore(factor);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const loading = status === "loading";

  const { byKey, top, bottom, colorFor } = useMemo(() => {
    const list = scores ?? [];
    const ranked: RankedCountry[] = [...list]
      .sort((a, b) => b.score - a.score)
      .map((s, i) => ({ ...s, rank: i + 1 }));
    return {
      byKey: new Map(list.map((s) => [s.key, s])),
      top: ranked.slice(0, 10),
      bottom: ranked.slice(-10).reverse(),
      colorFor: relativeColorScale(list.map((s) => s.score)),
    };
  }, [scores]);

  function submit(next: string) {
    if (next.toLowerCase() === factor.toLowerCase()) {
      if (status === "error") retry();
      return;
    }
    router.push(`${pathname}?factor=${encodeURIComponent(next)}`, { scroll: false });
  }

  const hasScores = top.length > 0;

  return (
    <>
      {/* Keyed by factor so back/forward navigation refills the input. */}
      <MapFactorBar key={factor} factor={factor} loading={loading} onSubmit={submit} />

      <main className="bg-page px-4 pt-5 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
          <section className="overflow-hidden rounded-[10px] border border-hairline bg-panel">
            <header className="flex min-h-[52px] flex-col gap-2.5 border-b border-hairline px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
              <h1 className="min-w-0 font-display text-[16px] leading-tight font-semibold text-main">
                {factor ? (
                  <>
                    Countries by <span className="text-accent">&ldquo;{factor}&rdquo;</span>
                  </>
                ) : (
                  <>
                    World map{" "}
                    <span className="font-sans text-[13.5px] font-normal text-muted">
                      Pick a factor and Jev scores every country on it.
                    </span>
                  </>
                )}
              </h1>
              {hasScores && (
                <MapLegend lowest={bottom[0].name} highest={top[0].name} />
              )}
            </header>

            {status === "error" && (
              <div
                role="alert"
                className={cn(
                  "flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[13px] sm:px-5",
                  code === "quota_exceeded"
                    ? "border-hairline bg-soft text-muted"
                    : "border-[#fee2e2] bg-[#fef2f2] text-[#b91c1c]",
                )}
              >
                <span>{error}</span>
                {code !== "quota_exceeded" && (
                  <button
                    type="button"
                    onClick={retry}
                    className="shrink-0 cursor-pointer rounded-md border border-[#fca5a5] bg-white px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-[#fee2e2]"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <WorldMap
              scores={byKey}
              colorFor={colorFor}
              loading={loading}
              countryCount={COUNTRIES.length}
              highlightKey={highlightKey}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
            />
          </section>

          {hasScores && (
            <div className={cn("grid gap-4 transition-opacity md:grid-cols-2", loading && "opacity-50")}>
              <RankedList
                title="Top 10"
                items={top}
                colorFor={colorFor}
                selectedKey={selectedKey}
                onHighlight={setHighlightKey}
                onSelect={setSelectedKey}
              />
              <RankedList
                title="Bottom 10"
                items={bottom}
                colorFor={colorFor}
                selectedKey={selectedKey}
                onHighlight={setHighlightKey}
                onSelect={setSelectedKey}
              />
            </div>
          )}

          <p className="text-center text-xs text-dim">
            Colors are relative: red is the lowest-scoring country, green the highest.
          </p>
        </div>
      </main>
    </>
  );
}
