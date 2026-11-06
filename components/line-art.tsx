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

/**
 * A fine-line dragonfly in flight: four veined wings that flutter and a body that
 * drifts a little (see .dragonfly-* in globals.css, which stands still for visitors
 * who prefer reduced motion). Drawn symmetrically around its body, then turned so
 * it flies up and to the left.
 */
export function Dragonfly({ className, "data-speed": speed }: ArtProps) {
  const wings = (
    <g>
      {/* Forewing */}
      <g className="dragonfly-fore">
        <path d="M57 36C44 24 22 18 6 24c-3 3 2 9 14 12 12 3 26 3 37 2Z" />
        <path d="M57 36C42 31 26 27 10 25M57 37C42 35 28 34 14 31" strokeWidth="0.8" />
        <path d="M20 22l1 11M30 24l1 11M40 28l1 8M13 26l1 8" strokeWidth="0.7" />
        <path d="M9 24l7 1" strokeWidth="1.800" />
      </g>
      {/* Hindwing */}
      <g className="dragonfly-hind">
        <path d="M57 42C44 42 22 50 8 62c-3 4 3 8 15 5 13-3 26-12 34-22Z" />
        <path d="M57 43C42 47 26 55 11 63M57 44C46 52 34 60 24 66" strokeWidth="0.8" />
        <path d="M22 54l5 9M32 50l4 9M42 46l3 8" strokeWidth="0.7" />
        <path d="M11 62l7-3" strokeWidth="1.800" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 120 120" className={className} data-speed={speed} aria-hidden="true" {...stroke} strokeWidth="1.250">
      <g className="dragonfly-drift" transform="rotate(-28 60 60)">
        {wings}
        <g transform="translate(120 0) scale(-1 1)">{wings}</g>
        {/* Head, eyes, thorax and a long segmented tail */}
        <circle cx="60" cy="25" r="4.500" />
        <circle cx="56.500" cy="24" r="2" strokeWidth="1" />
        <circle cx="63.500" cy="24" r="2" strokeWidth="1" />
        <path d="M56 31C56 27 64 27 64 31L63 46H57Z" />
        <path d="M57 46L58 108M63 46L62 108M58 108Q60 112 62 108" />
        <path d="M57.500 56h5M57.700 66h4.600M57.800 76h4.400M57.900 86h4.200M57.900 96h4.200" strokeWidth="0.9" />
      </g>
    </svg>
  );
}

/**
 * A long, delicate branch of eucalyptus-style leaves and round berry clusters.
 * It grows from the bottom-left of the box toward the top-right, so placed on a
 * photo's lower-left corner it reaches in from outside the frame.
 */
export function BotanicalBranch({ className, "data-speed": speed }: ArtProps) {
  // Leaves along the stem: where each starts, how it leans (0 = straight up) and how long it is.
  const leaves = [
    { x: 24, y: 268, r: -24, l: 56 },
    { x: 30, y: 258, r: 70, l: 46 },
    { x: 50, y: 232, r: -20, l: 62 },
    { x: 58, y: 220, r: 76, l: 54 },
    { x: 80, y: 190, r: -18, l: 66 },
    { x: 90, y: 178, r: 80, l: 58 },
    { x: 112, y: 148, r: -14, l: 60 },
    { x: 120, y: 138, r: 84, l: 50 },
    { x: 146, y: 104, r: -8, l: 48 },
    { x: 154, y: 94, r: 70, l: 42 },
    { x: 178, y: 60, r: 8, l: 40 },
    { x: 192, y: 34, r: 24, l: 34 },
  ];
  const clusters = [
    // [stem start x, y, then berry centres]
    { from: [50, 232], berries: [[22, 196], [10, 178], [32, 178], [20, 158], [40, 160], [8, 140], [28, 138]] },
    { from: [90, 178], berries: [[66, 138], [56, 118], [78, 120]] },
  ] as const;
  const leaf = (l: number) =>
    `M0 0C${-l * 0.24} ${-l * 0.28} ${-l * 0.2} ${-l * 0.72} 0 ${-l}C${l * 0.2} ${-l * 0.72} ${l * 0.24} ${-l * 0.28} 0 0Z`;
  return (
    <svg viewBox="0 0 220 300" className={className} data-speed={speed} aria-hidden="true" {...stroke} strokeWidth="2">
      <path d="M12 296C40 244 72 196 112 148S176 70 206 22" />
      {leaves.map((item) => (
        <g key={`${item.x}-${item.y}`} transform={`translate(${item.x} ${item.y}) rotate(${item.r})`}>
          <path d={leaf(item.l)} />
          <path d={`M0 0V${-item.l * 0.9}`} strokeWidth="1.1" />
          <path
            d={`M0 ${-item.l * 0.3}l${item.l * 0.12} ${-item.l * 0.12}M0 ${-item.l * 0.3}l${-item.l * 0.12} ${-item.l * 0.12}M0 ${-item.l * 0.55}l${item.l * 0.1} ${-item.l * 0.1}M0 ${-item.l * 0.55}l${-item.l * 0.1} ${-item.l * 0.1}`}
            strokeWidth="0.9"
          />
        </g>
      ))}
      {clusters.map((cluster) => (
        <g key={cluster.from.join("-")}>
          {cluster.berries.map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <path d={`M${cluster.from[0]} ${cluster.from[1]}Q${(cluster.from[0] + cx) / 2 - 6} ${(cluster.from[1] + cy) / 2} ${cx} ${cy + 6}`} strokeWidth="1" />
              <circle cx={cx} cy={cy} r="7.500" />
              <circle cx={cx - 1.500} cy={cy - 1} r="0.8" fill="currentColor" />
              <circle cx={cx + 1.800} cy={cy + 0.500} r="0.8" fill="currentColor" />
              <circle cx={cx} cy={cy + 2.500} r="0.8" fill="currentColor" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
