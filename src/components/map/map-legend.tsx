import { LEGEND_GRADIENT } from "@/lib/map/color";

export function MapLegend({ lowest, highest }: { lowest: string; highest: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 sm:w-[260px]" aria-label={`Lowest ${lowest}, highest ${highest}`}>
      <div className="h-2 w-full rounded-full" style={{ background: LEGEND_GRADIENT }} />
      <div className="grid grid-cols-2 gap-3 text-xs text-muted">
        <span className="truncate" title={lowest}>{lowest}</span>
        <span className="truncate text-right" title={highest}>{highest}</span>
      </div>
    </div>
  );
}
