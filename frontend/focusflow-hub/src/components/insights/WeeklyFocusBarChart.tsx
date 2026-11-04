import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyData {
  day: string;
  minutes: number;
  tasks: number;
}

interface WeeklyFocusBarChartProps {
  data: DailyData[];
}

export function WeeklyFocusBarChart({ data }: WeeklyFocusBarChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Weekly Focus Velocity
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Minutes spent in deep execution blocks across the last 7 days
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              unit="m"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as DailyData;
                  return (
                    <div className="bg-popover border border-border rounded-xl p-3 shadow-medium text-xs">
                      <p className="font-semibold text-foreground mb-1">{d.day}</p>
                      <p className="text-primary font-medium">{d.minutes} minutes focused</p>
                      <p className="text-muted-foreground">{d.tasks} tasks completed</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="minutes"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
