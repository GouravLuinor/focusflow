import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Target, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoalData {
  id: number;
  name: string;
  count: number;
  color: string;
}

interface GoalDistributionDonutProps {
  data: GoalData[];
}

export function GoalDistributionDonut({ data }: GoalDistributionDonutProps) {
  const navigate = useNavigate();
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Goal Distribution
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {total} total tasks
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Task concentration across your active learning and project goals
        </p>

        {data.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
            No active goals configured
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as GoalData;
                        return (
                          <div className="bg-popover border border-border rounded-xl p-2 shadow-medium text-xs">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-primary">{item.count} tasks</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 w-full">
              {data.slice(0, 4).map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => navigate(`/goal/${goal.id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-secondary/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {goal.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground group-hover:text-foreground">
                    <span>{goal.count}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
