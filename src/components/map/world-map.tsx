"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { useReducedMotion } from "motion/react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { NO_DATA_COLOR } from "@/lib/map/color";
import { COUNTRY_FEATURES } from "@/lib/map/countries";
import { toPercent, toPercentScore, type CountryScore } from "@/lib/map/questions";
import { cn } from "@/lib/utils";

const WIDTH = 960;
const HEIGHT = 470;
const MAX_ZOOM = 8;
const TOOLTIP_WIDTH = 200;

interface Hover {
  key: string;
  x: number;
  y: number;
  /** Near the right edge, the tooltip opens to the left of the cursor. */
  flip: boolean;
}

export function WorldMap({
  scores,
  colorFor,
  loading,
  countryCount,
  highlightKey,
  selectedKey,
  onSelect,
}: {
  scores: Map<string, CountryScore>;
  colorFor: (score: number) => string;
  loading: boolean;
  countryCount: number;
  /** Outlined from outside the map, e.g. while a ranked row is hovered. */
  highlightKey: string | null;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const reduceMotion = useReducedMotion();

  const { countries, byKey } = useMemo(() => {
    const projection = geoEqualEarth().fitSize([WIDTH, HEIGHT], {
      type: "FeatureCollection",
      features: COUNTRY_FEATURES,
    });
    const path = geoPath(projection);
    const countries = COUNTRY_FEATURES.map((f) => ({
      key: f.key,
      name: f.properties.name,
      d: path(f) ?? "",
    }));
    return { countries, byKey: new Map(countries.map((c) => [c.key, c])) };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .extent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      // A plain wheel keeps scrolling the page; trackpad pinch arrives as
      // ctrl+wheel, so it (and ⌘/Ctrl+wheel) still zooms.
      .filter((event: Event) => {
        if (event.type === "wheel") {
          const wheel = event as WheelEvent;
          return wheel.ctrlKey || wheel.metaKey;
        }
        if (event.type === "mousedown") return (event as MouseEvent).button === 0;
        return true;
      })
      .on("zoom", (event) => {
        layerRef.current?.setAttribute("transform", event.transform.toString());
        setZoomed(event.transform.k > 1.001);
        setHover(null);
      });
    select(svg).call(behavior);
    zoomRef.current = behavior;
    return () => {
      select(svg).on(".zoom", null);
    };
  }, []);

  function zoomBy(factor: number) {
    const svg = svgRef.current;
    const behavior = zoomRef.current;
    if (!svg || !behavior) return;
    select(svg)
      .transition()
      .duration(reduceMotion ? 0 : 250)
      .call(behavior.scaleBy, factor);
  }

  function resetZoom() {
    const svg = svgRef.current;
    const behavior = zoomRef.current;
    if (!svg || !behavior) return;
    select(svg)
      .transition()
      .duration(reduceMotion ? 0 : 300)
      .call(behavior.transform, zoomIdentity);
  }

  function handlePointerMove(e: React.PointerEvent, key: string) {
    if (e.pointerType !== "mouse") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setHover({ key, x, y: e.clientY - rect.top, flip: x + 14 + TOOLTIP_WIDTH > rect.width });
  }

  const outlineKey = highlightKey ?? hover?.key ?? selectedKey;
  const outline = outlineKey ? byKey.get(outlineKey) : undefined;
  const selected = selectedKey ? byKey.get(selectedKey) : undefined;
  const hovered = hover && hover.key !== selectedKey ? byKey.get(hover.key) : undefined;

  return (
    <div ref={containerRef} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`World map of ${countryCount} countries, colored by score`}
        className={cn(
          "block h-auto w-full select-none transition-opacity duration-300",
          loading && "opacity-50",
          // At 1× one finger scrolls the page and two fingers pinch the map;
          // once zoomed in, every touch belongs to the map.
          zoomed ? "cursor-grab touch-none active:cursor-grabbing" : "touch-pan-y",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        <g ref={layerRef}>
          {countries.map(({ key, name, d }) => {
            const s = scores.get(key);
            return (
              <path
                key={key}
                d={d}
                fill={s ? colorFor(s.score) : NO_DATA_COLOR}
                stroke="#ffffff"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-[fill] duration-500"
                aria-label={name}
                onPointerMove={(e) => handlePointerMove(e, key)}
                onPointerLeave={() => setHover(null)}
                onClick={() => onSelect(key === selectedKey ? null : key)}
              />
            );
          })}
          {outline && (
            <path
              d={outline.d}
              fill="none"
              stroke="var(--text-main)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel px-3.5 py-1.5 text-[13px] font-medium text-main shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            Scoring {countryCount} countries…
          </div>
        </div>
      )}

      {hover && hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-hairline bg-panel px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          style={{
            width: TOOLTIP_WIDTH,
            left: hover.flip ? hover.x - 14 - TOOLTIP_WIDTH : hover.x + 14,
            top: hover.y + 14,
          }}
        >
          <CountryDetails name={hovered.name} score={scores.get(hovered.key)} />
        </div>
      )}

      {/* On phones the card and controls sit in a strip under the map so they
          don't cover the (small) map; from sm up they float over its corners. */}
      <div className="flex min-h-[60px] items-center gap-3 border-t border-hairline p-3 sm:contents">
        {selected ? (
          <div className="min-w-0 flex-1 rounded-lg border border-hairline bg-panel py-2.5 pr-2 pl-3 sm:absolute sm:bottom-3 sm:left-3 sm:z-10 sm:w-[240px] sm:flex-none sm:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <CountryDetails name={selected.name} score={scores.get(selected.key)} />
              </div>
              <button
                type="button"
                onClick={() => onSelect(null)}
                aria-label={`Close ${selected.name}`}
                className="-mt-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-dim transition-colors hover:bg-soft hover:text-main"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-xs leading-snug text-dim sm:hidden">
            Tap a country for details. Pinch to zoom.
          </p>
        )}

        <div className="flex shrink-0 self-end overflow-hidden rounded-lg border border-hairline bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:absolute sm:right-3 sm:bottom-3 sm:flex-col">
          <ZoomButton label="Zoom in" onClick={() => zoomBy(1.6)}>
            <Plus className="size-4" />
          </ZoomButton>
          <ZoomButton label="Zoom out" onClick={() => zoomBy(1 / 1.6)} disabled={!zoomed}>
            <Minus className="size-4" />
          </ZoomButton>
          <ZoomButton label="Reset zoom" onClick={resetZoom} disabled={!zoomed}>
            <RotateCcw className="size-3.5" />
          </ZoomButton>
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 cursor-pointer items-center justify-center border-r border-hairline text-muted transition-colors last:border-0 sm:size-8 sm:border-r-0 sm:border-b sm:last:border-b-0 hover:bg-soft hover:text-main disabled:cursor-default disabled:text-dim/60 disabled:hover:bg-panel"
    >
      {children}
    </button>
  );
}

function CountryDetails({ name, score }: { name: string; score: CountryScore | undefined }) {
  return (
    <>
      <div className="font-display text-[15px] leading-tight font-semibold text-balance text-main">{name}</div>
      {score ? (
        <div className="mt-1.5 flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[20px] leading-none font-semibold text-main tabular-nums">
              {toPercentScore(score.score)}
            </span>
            <span className="text-xs text-dim">/100</span>
          </div>
          <div className="text-[12.5px] leading-snug text-muted">{score.level}</div>
          <div className="text-xs text-dim">{toPercent(score.confidence)} confidence</div>
        </div>
      ) : (
        <div className="mt-1 text-[12.5px] text-muted">Not scored yet</div>
      )}
    </>
  );
}
