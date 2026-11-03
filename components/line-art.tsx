/** Original line illustrations drawn for Frames by Stuti. */
// data-speed adds scroll depth (see components/scroll-motion.tsx).
type ArtProps = { className?: string; "data-speed"?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A six-bladed camera aperture that doubles as the brand's flower motif. */
export function ApertureBloom({ className, "data-speed": speed }: ArtProps) {
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 120 120" className={className} data-speed={speed} aria-hidden="true" {...stroke} strokeWidth="1.6">
      {blades.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 60 60)`}>
          <path d="M60 46C48 34 47 16 60 5c13 11 12 29 0 41Z" />
          <path d="M60 41c-3-8-3-18 0-27" strokeWidth="1" />
        </g>
      ))}
      <circle cx="60" cy="60" r="13" />
      <path d="M60 47l6 15M71.300 53.500L55 55.700M71.300 66.500L61.400 53.500M60 73l-6-15M48.700 66.500L65 64.300M48.700 53.500L58.600 66.500" strokeWidth="1" />
    </svg>
  );
}

/** A sweeping stem with paired leaves and small berry clusters. */
export function LeafSprig({ className, "data-speed": speed }: ArtProps) {
  const leaves = [
    { x: 58, y: 182, r: -62, s: 1.15 },
    { x: 80, y: 150, r: 36, s: 1.05 },
    { x: 92, y: 118, r: -48, s: 0.95 },
    { x: 118, y: 92, r: 46, s: 0.85 },
    { x: 128, y: 62, r: -30, s: 0.7 },
    { x: 152, y: 42, r: 56, s: 0.6 },
  ];
  const berries = [
    [38, 142],
    [28, 128],
    [44, 124],
    [22, 110],
    [38, 104],
    [54, 106],
    [150, 112],
    [166, 100],
    [156, 90],
    [172, 80],
  ];
  return (
    <svg viewBox="0 0 200 240" className={className} data-speed={speed} aria-hidden="true" {...stroke} strokeWidth="1.8">
      <path d="M22 236C50 190 70 150 104 104S160 36 176 18" />
      <path d="M72 158C60 148 52 136 44 124M124 84c12 6 22 14 32 22" strokeWidth="1.2" />
      {leaves.map((leaf) => (
        <g
          key={`${leaf.x}-${leaf.y}`}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}
        >
          <path d="M0 0C-16-16-16-40 0-58 16-40 16-16 0 0Z" />
          <path d="M0 0V-50" strokeWidth="1" />
        </g>
      ))}
      {berries.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
      ))}
    </svg>
  );
}

/** A silhouette of a vintage camera on a short strap. */
export function CameraSketch({ className, "data-speed": speed }: ArtProps) {
  return (
    <svg viewBox="0 0 120 90" className={className} data-speed={speed} aria-hidden="true" {...stroke} strokeWidth="1.6">
      <path d="M12 30h22l6-10h30l6 10h32v48H12Z" />
      <circle cx="58" cy="52" r="19" />
      <circle cx="58" cy="52" r="11" />
      <path d="M20 22h10v8M92 38h10" />
      <path d="M12 38C2 30 4 12 22 8s60-6 76 0 18 22 10 30" strokeWidth="1" />
    </svg>
  );
}

/** An eight-pointed glint in a cool silver. */
export function Sparkle({ className, "data-speed": speed }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} data-speed={speed} aria-hidden="true">
      <path
        fill="#d8dadd"
        d="M32 0l3.200 22.400L48 8 38.600 25.400 64 32l-25.400 6.600L48 56 35.200 41.600 32 64l-3.200-22.400L16 56l9.400-17.400L0 32l25.400-6.600L16 8l12.800 14.400Z"
      />
      <circle cx="32" cy="32" r="4" fill="#fff" />
    </svg>
  );
}
