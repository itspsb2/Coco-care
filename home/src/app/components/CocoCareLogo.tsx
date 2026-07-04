interface CocoCareLogo {
  color?: string;
  height?: number;
  showText?: boolean;
}

export function CocoCareLogo({ color = "#2d5016", height = 40, showText = true }: CocoCareLogo) {
  // Junction center: (110, 108), frond length: 72
  // 9 fronds from -75° to +75° in 18.75° steps
  const cx = 110;
  const cy = 108;
  const L = 72;

  const toRad = (d: number) => (d * Math.PI) / 180;

  // Each frond: filled leaf shape between two bezier curves
  const frondAngles = [-75, -56, -38, -20, 0, 20, 38, 56, 75];

  const fronds = frondAngles.map((deg) => {
    const r = toRad(deg);
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    // Perpendicular direction
    const px = cos;
    const py = sin;
    // Tip
    const ex = cx + L * sin;
    const ey = cy - L * cos;
    // Mid along frond
    const mx = cx + (L * 0.52) * sin;
    const my = cy - (L * 0.52) * cos;
    // Bulge amount (wider toward middle, narrower for steep fronds)
    const bulge = 13 - Math.abs(deg) * 0.04;
    // Control points (one each side)
    const c1x = mx + bulge * px;
    const c1y = my + bulge * py;
    const c2x = mx - bulge * px;
    const c2y = my - bulge * py;

    return `M ${cx},${cy} Q ${c1x.toFixed(1)},${c1y.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)} Q ${c2x.toFixed(1)},${c2y.toFixed(1)} ${cx},${cy} Z`;
  });

  return (
    <svg
      viewBox="0 0 220 235"
      style={{ height, width: "auto", display: "block" }}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CocoCare"
    >
      {/* Palm fronds */}
      {fronds.map((d, i) => (
        <path key={i} d={d} />
      ))}

      {/* Short trunk below junction */}
      <path d={`M ${cx - 4},${cy + 2} L ${cx - 3},${cy + 18} L ${cx + 3},${cy + 18} L ${cx + 4},${cy + 2} Z`} />

      {/* Oil / water drop — point at top, round at bottom */}
      <path
        d={`M ${cx},${cy + 16} C ${cx + 11},${cy + 26} ${cx + 12},${cy + 40} ${cx},${cy + 46} C ${cx - 12},${cy + 40} ${cx - 11},${cy + 26} ${cx},${cy + 16} Z`}
      />

      {/* Wordmark */}
      {showText && (
        <text
          x={cx}
          y="210"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif"
          fontWeight="800"
          fontSize="24"
          letterSpacing="7"
          fill={color}
        >
          COCO CARE
        </text>
      )}
    </svg>
  );
}
