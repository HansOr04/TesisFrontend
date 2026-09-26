import { SCORE_COLORS } from "@/shared/design/score-colors";
// Velocímetro de aguja por dimensión/global (FE3-B04), replicando el diseño de Figma:
// semicírculo con 3 zonas fijas (rojo 0–5, amarillo 5–7, risk 7–10) y una aguja que
// apunta al valor. Sin dependencias nuevas — SVG propio.
const RED = SCORE_COLORS.critical;
const YELLOW = "#EAB308"; // antes naranja (SCORE_COLORS.medium); solo para velocímetros
const GREEN = SCORE_COLORS.high;

// Umbrales de zona visual (leyenda del mockup: 0-5 Bajo, 5-7 Medio, 7-10 Alto).
// Coloreado crítico de negocio (RF-03: score <= 5) usa el mismo corte rojo/no-rojo.
export function gaugeColor(value: number): string {
  if (value <= 5) return RED;
  if (value < 7) return YELLOW;
  return GREEN;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function angleForValue(value: number): number {
  return 180 * (1 - Math.max(0, Math.min(10, value)) / 10);
}

interface GaugeProps {
  value: number; // 0-10
  label?: string;
  weightLabel?: string; // e.g. "PESO 25%"
  size?: "lg" | "sm";
}

export function Gauge({ value, label, weightLabel, size = "sm" }: GaugeProps) {
  const clamped = Math.max(0, Math.min(10, value));
  const box = size === "lg" ? 260 : 150;
  const cx = box / 2;
  const cy = box / 2 + 6;
  const r = box / 2 - 20;
  const strokeWidth = size === "lg" ? 14 : 9;

  const needleAngle = angleForValue(clamped);
  const needleLen = r * 0.82;
  const needleTip = polar(cx, cy, needleLen, needleAngle);

  return (
    <div
      className="flex flex-col items-center"
      data-testid="gauge"
      style={{ width: box }}
    >
      <svg width={box} height={cy + 14} viewBox={`0 0 ${box} ${cy + 14}`}>
        <path
          d={arcPath(cx, cy, r, 180, 90)}
          fill="none"
          stroke={RED}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={arcPath(cx, cy, r, 90, 54)}
          fill="none"
          stroke={YELLOW}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={arcPath(cx, cy, r, 54, 0)}
          fill="none"
          stroke={GREEN}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={SCORE_COLORS.ink}
          strokeWidth={size === "lg" ? 3 : 2}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={size === "lg" ? 6 : 4}
          fill={SCORE_COLORS.ink}
        />
      </svg>
      <span
        className={size === "lg" ? "text-3xl font-bold" : "text-lg font-bold"}
        style={{
          color: gaugeColor(clamped),
          marginTop: size === "lg" ? -8 : -4,
        }}
        data-testid="gauge-value"
      >
        {clamped.toFixed(1)}
      </span>
      {weightLabel && (
        <span
          className="text-[10px] font-semibold mt-0.5 rounded px-1.5 py-0.5"
          style={{
            color: "var(--color-warning)",
            backgroundColor: "hsl(var(--warning) / 0.12)",
          }}
        >
          {weightLabel}
        </span>
      )}
      {label && (
        <span className="text-xs text-muted-foreground text-center leading-tight mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
