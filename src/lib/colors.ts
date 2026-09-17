/**
 * Static Tailwind class lookup per factor color. Written out in full (not
 * templated) so Tailwind's content scanner can find every class.
 */
export interface ColorClasses {
  chip: string;
  bar: string;
  dot: string;
  headerText: string;
}

export const COLOR_CLASSES: Record<string, ColorClasses> = {
  amber: {
    chip: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    bar: "bg-amber-400",
    dot: "bg-amber-500",
    headerText: "text-amber-700 dark:text-amber-300",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    bar: "bg-emerald-400",
    dot: "bg-emerald-500",
    headerText: "text-emerald-700 dark:text-emerald-300",
  },
  orange: {
    chip: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
    bar: "bg-orange-400",
    dot: "bg-orange-500",
    headerText: "text-orange-700 dark:text-orange-300",
  },
  rose: {
    chip: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
    bar: "bg-rose-400",
    dot: "bg-rose-500",
    headerText: "text-rose-700 dark:text-rose-300",
  },
  sky: {
    chip: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
    bar: "bg-sky-400",
    dot: "bg-sky-500",
    headerText: "text-sky-700 dark:text-sky-300",
  },
  fuchsia: {
    chip: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900",
    bar: "bg-fuchsia-400",
    dot: "bg-fuchsia-500",
    headerText: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  lime: {
    chip: "bg-lime-50 text-lime-800 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900",
    bar: "bg-lime-400",
    dot: "bg-lime-500",
    headerText: "text-lime-700 dark:text-lime-300",
  },
  indigo: {
    chip: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
    bar: "bg-indigo-400",
    dot: "bg-indigo-500",
    headerText: "text-indigo-700 dark:text-indigo-300",
  },
  cyan: {
    chip: "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900",
    bar: "bg-cyan-400",
    dot: "bg-cyan-500",
    headerText: "text-cyan-700 dark:text-cyan-300",
  },
  violet: {
    chip: "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
    bar: "bg-violet-400",
    dot: "bg-violet-500",
    headerText: "text-violet-700 dark:text-violet-300",
  },
  teal: {
    chip: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900",
    bar: "bg-teal-400",
    dot: "bg-teal-500",
    headerText: "text-teal-700 dark:text-teal-300",
  },
  pink: {
    chip: "bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900",
    bar: "bg-pink-400",
    dot: "bg-pink-500",
    headerText: "text-pink-700 dark:text-pink-300",
  },
  blue: {
    chip: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    bar: "bg-blue-400",
    dot: "bg-blue-500",
    headerText: "text-blue-700 dark:text-blue-300",
  },
};

export function colorClasses(color: string): ColorClasses {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES.blue;
}
