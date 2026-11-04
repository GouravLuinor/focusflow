import { Target, TrendingUp, AlertTriangle } from "lucide-react";

interface EstimationAccuracyGaugeProps {
  ratio: number;
  averageEstimateMinutes: number;
  averageActualMinutes: number;
  tasksAnalyzed: number;
}

export function EstimationAccuracyGauge({
  ratio,
  averageEstimateMinutes,
  averageActualMinutes,
  tasksAnalyzed,
}: EstimationAccuracyGaugeProps) {
  const percentage = Math.round(ratio * 100);
  const isAccurate = ratio >= 0.85 && ratio <= 1.15;
  const isUnderestimating = ratio > 1.15;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Estimation Calibration
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          AI adaptation metric comparing planned vs actual focus duration
        </p>

        <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4 border border-border/50 mb-4">
          <div className="text-3xl font-bold text-foreground">
            {percentage}%
          </div>
          <div className="text-xs">
            {isAccurate ? (
              <span className="text-success font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> High accuracy calibration
              </span>
            ) : isUnderestimating ? (
              <span className="text-accent font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Tendency to underestimate
              </span>
            ) : (
              <span className="text-primary font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Overestimating durations
              </span>
            )}
            <p className="text-muted-foreground mt-0.5">
              Based on {tasksAnalyzed} completed {tasksAnalyzed === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-background border border-border rounded-xl">
            <span className="text-muted-foreground block mb-0.5">Avg Planned</span>
            <span className="font-semibold text-foreground text-sm">
              {averageEstimateMinutes} min
            </span>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl">
            <span className="text-muted-foreground block mb-0.5">Avg Actual</span>
            <span className="font-semibold text-foreground text-sm">
              {averageActualMinutes} min
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Adaptive scheduling automatically adjusts buffer multipliers based on this ratio.
      </p>
    </div>
  );
}
