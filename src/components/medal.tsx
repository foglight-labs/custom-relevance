const MEDALS = {
  1: { fill: "#d4a72c", shade: "#b88d22", label: "Gold" },
  2: { fill: "#9aa3ad", shade: "#808892", label: "Silver" },
  3: { fill: "#b87333", shade: "#9c5e26", label: "Bronze" },
} as const;

export type MedalRank = keyof typeof MEDALS;

export function isMedalRank(rank: number): rank is MedalRank {
  return rank === 1 || rank === 2 || rank === 3;
}

/** Ribboned medal for the top three ranks; ranks 4+ render as plain numerals. */
export function Medal({ rank }: { rank: MedalRank }) {
  const { fill, shade, label } = MEDALS[rank];
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      role="img"
      aria-label={`Rank ${rank}, ${label} medal`}
    >
      <path d="M7 12L4.5 20.5L8 19L10 14" fill={shade} />
      <path d="M15 12L17.5 20.5L14 19L12 14" fill={fill} />
      <circle cx="11" cy="9.5" r="7" fill={fill} stroke={shade} strokeWidth="0.75" />
      <circle cx="11" cy="9.5" r="5.2" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" />
      <text x="11" y="12.5" fontSize="8.5" fontWeight="700" fill="#ffffff" textAnchor="middle">
        {rank}
      </text>
    </svg>
  );
}
