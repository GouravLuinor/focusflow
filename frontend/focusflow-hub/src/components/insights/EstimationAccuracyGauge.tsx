import { Target, TrendingUp, TrendingDown, AlertTriangle, Sprout } from "lucide-react";

interface EstimationAccuracyGaugeProps {
  /** actual / planned; null when no completed task has measured time yet. */
  ratio: number | null;
  averageEstimateMinutes: number | null;
  averageActualMinutes: number | null;
  tasksAnalyzed: number;
}

/** Below this many measured tasks the ratio is shown as an early signal, not a verdict. */
const MIN_TASKS_FOR_VERDICT = 3;

export function EstimationAccuracyGauge({
  ratio,
  averageEstimateMinutes,
  averageActualMinutes,
  tasksAnalyzed,
}: EstimationAccuracyGaugeProps) {
  const hasData = ratio !== null && tasksAnalyzed > 0;
  const isEarly = hasData && tasksAnalyzed < MIN_TASKS_FOR_VERDICT;
  const isAccurate = hasData && ratio >= 0.85 && ratio <= 1.15;
  const isUnderestimating = hasData && ratio > 1.15;
  const taskWord = tasksAnalyzed === 1 ? 'task' : 'tasks';

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
          Planned vs actual focus time on completed tasks
        </p>

        {hasData ? (
          <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4 border border-border/50 mb-4">
            <div className="text-3xl font-bold text-foreground">
              {Math.round(ratio * 100)}%
            </div>
            <div className="text-xs">
              {isEarly ? (
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5" /> Early signal
                </span>
              ) : isAccurate ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Estimates are on target
                </span>
              ) : isUnderestimating ? (
                <span className="text-accent font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Tendency to underestimate
                </span>
              ) : (
                <span className="text-primary font-medium flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Tendency to overestimate
                </span>
              )}
              <p className="text-muted-foreground mt-0.5">
                Based on {tasksAnalyzed} measured {taskWord}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 mb-4">
            <p className="text-sm font-medium text-foreground">No measurements yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete an estimated task in Focus Mode to start calibrating.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-background border border-border rounded-xl">
            <span className="text-muted-foreground block mb-0.5">Avg Planned</span>
            <span className="font-semibold text-foreground text-sm">
              {averageEstimateMinutes !== null ? `${averageEstimateMinutes} min` : '—'}
            </span>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl">
            <span className="text-muted-foreground block mb-0.5">Avg Actual</span>
            <span className="font-semibold text-foreground text-sm">
              {averageActualMinutes !== null ? `${averageActualMinutes} min` : '—'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Each task's suggested duration blends your estimate with your most recent measured session.
      </p>
    </div>
  );
}
