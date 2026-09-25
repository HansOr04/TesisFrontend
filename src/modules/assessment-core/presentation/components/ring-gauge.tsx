import { SCORE_COLORS } from "@/shared/design/score-colors";
import { gaugeColor } from "./gauge";

// Anillo de progreso circular (0–10). Con `label` muestra el texto debajo;
// en tamaños pequeños (tarjetas de KPI) se usa sin etiqueta y con trazo fino.
interface RingGaugeProps {
  value: number; // 0-10
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** Muestra el valor como entero (p.ej. "4") en vez de "4.0". */
  integer?: boolean;
}

export function RingGauge({
  value,
  label,
  size = 110,
  strokeWidth = 9,
  color,
  integer,
}: RingGaugeProps) {
  const clamped = Math.max(0, Math.min(10, value));
  const r = size / 2 - strokeWidth - 1;
  const circumference = 2 * Math.PI * r;
  const dash = (clamped / 10) * circumference;
  const stroke = color ?? gaugeColor(clamped);
  const text = integer ? String(Math.round(clamped)) : clamped.toFixed(1);

  return (
    <div
      className="flex shrink-0 flex-col items-center"
      style={{ width: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={SCORE_COLORS.track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + size / 12}
          textAnchor="middle"
          fontSize={size / 3.6}
          fontWeight="800"
          fill={stroke}
        >
          {text}
        </text>
      </svg>
      {label && (
        <span className="mt-1 text-center text-xs text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
