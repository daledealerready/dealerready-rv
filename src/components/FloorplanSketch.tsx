import type { SampleFloorplan } from "@/lib/floorplan-sample";

const FILL: Record<string, string> = {
  Cab: "#d5dbe0",
  Living: "#e6eee8",
  Kitchen: "#f3e7d4",
  Bedroom: "#f6e4c4",
  "Half bath": "#d7e7f5",
  Bath: "#c5daf0",
  Bunks: "#d5ecd8",
  "Drop-down": "#e7dcc8",
};

export function FloorplanSketch({
  plan,
  large = false,
}: {
  plan: SampleFloorplan;
  large?: boolean;
}) {
  const bands = plan.sketch;
  const width = 640;
  const height = 168;
  const pad = 8;
  const gap = 4;
  const inner = width - pad * 2;
  const bandWidth = (inner - gap * (bands.length - 1)) / bands.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${plan.year} ${plan.make} ${plan.model} ${plan.floorplan} layout sketch`}
      className={large ? "h-auto w-full" : "h-28 w-full"}
    >
      <rect x="0" y="0" width={width} height={height} rx="18" fill="#f7f4ef" stroke="#1f2a2e" strokeWidth="3" />
      <text x={pad} y="22" fill="#1f2a2e" fontSize={large ? 14 : 12} fontFamily="sans-serif">
        Front
      </text>
      <text x={width - pad} y="22" fill="#1f2a2e" fontSize={large ? 14 : 12} fontFamily="sans-serif" textAnchor="end">
        Rear
      </text>
      {bands.map((band, bandIndex) => {
        const x = pad + bandIndex * (bandWidth + gap);
        const y = 32;
        const bandHeight = height - y - pad;
        const cellGap = 4;
        const cellHeight = (bandHeight - cellGap * (band.length - 1)) / band.length;
        return band.map((cell, cellIndex) => {
          const cellY = y + cellIndex * (cellHeight + cellGap);
          return (
            <g key={`${cell.label}-${bandIndex}-${cellIndex}`}>
              <rect
                x={x}
                y={cellY}
                width={bandWidth}
                height={cellHeight}
                rx="8"
                fill={FILL[cell.label] || "#eee"}
                stroke="#1f2a2e"
                strokeWidth="1.5"
              />
              <text
                x={x + bandWidth / 2}
                y={cellY + cellHeight / 2 + 4}
                textAnchor="middle"
                fill="#1f2a2e"
                fontSize={large ? 16 : 13}
                fontFamily="sans-serif"
              >
                {cell.label}
              </text>
            </g>
          );
        });
      })}
    </svg>
  );
}
