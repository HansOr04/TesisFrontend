import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart as RecLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineChartProps {
  title?: string;
  chartData: { key: string; value: number }[];
  lineType?: "linear" | "natural";
  showValues?: boolean;
  color?: string;
  yDomain?: [number, number];
}

// Gráfico de línea simple (evolución en el tiempo). Espera puntos {key, value}.
export function LineChart({
  chartData,
  lineType = "natural",
  showValues = false,
  color = "#17457A",
  yDomain = [0, 10],
}: LineChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RecLineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="key" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis domain={yDomain} tickLine={false} axisLine={false} fontSize={12} width={28} />
          <Tooltip />
          <Line type={lineType} dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 4 }}>
            {showValues && <LabelList dataKey="value" position="top" fontSize={11} />}
          </Line>
        </RecLineChart>
      </ResponsiveContainer>
    </div>
  );
}
