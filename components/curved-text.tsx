import { useId, type SVGAttributes } from "react";

type CurvedTextProps = {
  text: string;
  className?: string;
  /** How far the arc rises, as a share of the width. */
  rise?: number;
  /** Text size in viewBox units, where the width is 1000. */
  size?: number;
  uppercase?: boolean;
  italic?: boolean;
} & Omit<SVGAttributes<SVGSVGElement>, "className" | "children">;

/** Live text set along a gentle arc. */
export function CurvedText({
  text,
  className,
  rise = 0.07,
  size = 94,
  uppercase = false,
  italic = true,
  ...rest
}: CurvedTextProps) {
  const id = useId();
  const height = 1000 * rise + size * 1.5;
  const baseline = height - size * 0.45;
  const control = baseline - 1000 * rise * 2;
  return (
    <svg
      viewBox={`0 0 1000 ${height}`}
      role="img"
      aria-label={text}
      className={className}
      {...rest}
    >
      <path id={id} d={`M10 ${baseline}Q500 ${control} 990 ${baseline}`} fill="none" />
      <text
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize={size}
        fontStyle={italic ? "italic" : "normal"}
        letterSpacing={uppercase ? 1 : -1.5}
        textAnchor="middle"
      >
        <textPath href={`#${id}`} startOffset="50%">
          {uppercase ? text.toUpperCase() : text}
        </textPath>
      </text>
    </svg>
  );
}
