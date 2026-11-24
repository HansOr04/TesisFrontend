import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarLineChartProps {
  chartData: { key: string; value: number }[];
  /** Color de cada barra según su valor (por ejemplo, el del semáforo). */
  barColor: (value: number) => string;
  lineColor?: string;
  yDomain?: [number, number];
  valueLabel?: string;
}

// Evolución en el tiempo en barras (una por corte, con el color de su nivel)
// y una línea encima que une los resultados para ver la tendencia.
export function BarLineChart({
  chartData,
  barColor,
  lineColor = "#17457A",
  yDomain = [0, 10],
  valueLabel,
}: BarLineChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={28}
          />
          <Tooltip
            formatter={(value) => [value, valueLabel ?? ""]}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar
            dataKey="value"
            maxBarSize={56}
            radius={[6, 6, 0, 0]}
            fillOpacity={0.85}
            isAnimationActive={false}
          >
            {chartData.map((d) => (
              <Cell key={d.key} fill={barColor(d.value)} />
            ))}
          </Bar>
          <Line
            type="linear"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="value"
              position="top"
              offset={10}
              fontSize={11}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
