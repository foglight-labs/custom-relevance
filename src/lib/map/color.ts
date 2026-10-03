import { interpolateRdYlGn } from "d3-scale-chromatic";

/** Unscored countries sit in a paper tone so the map reads as "blank", not "bad". */
export const NO_DATA_COLOR = "#e6e1d8";

export const LEGEND_GRADIENT = `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1]
  .map((t) => interpolateRdYlGn(t))
  .join(", ")})`;

/** Stretches colors so the lowest score is red and the highest is green. */
export function relativeColorScale(values: number[]): (value: number) => string {
  if (values.length === 0) return () => NO_DATA_COLOR;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  return (value) => interpolateRdYlGn(span === 0 ? 0.5 : (value - min) / span);
}
