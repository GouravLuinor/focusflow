import { useState } from 'react';
import { Check, ChevronDown, Circle, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export interface FocusStep {
  id: number;
  content: string;
  order: number;
  is_completed: boolean;
}

interface FocusCheckpointProps {
  steps: FocusStep[];
  onToggleStep: (step: FocusStep) => void;
  pendingStepId?: number | null;
  /** Fallback progress when a task has no steps but has subtasks. */
  subtasksCompleted?: number;
  subtasksTotal?: number;
  /** When provided, a task with no steps offers to generate them with AI. */
  onGenerateSteps?: () => void;
  isGeneratingSteps?: boolean;
}

export function FocusCheckpoint({
  steps,
  onToggleStep,
  pendingStepId = null,
  subtasksCompleted = 0,
  subtasksTotal = 0,
  onGenerateSteps,
  isGeneratingSteps = false,
}: FocusCheckpointProps) {
  const { supportMode } = useApp();
  // ADHD mode: show only the current step by default to reduce clutter.
  const [showAll, setShowAll] = useState(supportMode !== 'adhd');

  const doneCount = steps.filter((s) => s.is_completed).length;
  const current = steps.find((s) => !s.is_completed) ?? null;
  const allDone = steps.length > 0 && !current;

  const cardClass = cn(
    'w-full bg-card border border-border rounded-xl flex flex-col relative overflow-hidden text-left transition-all duration-200',
    supportMode === 'dyslexia' ? 'p-7 gap-4 shadow-md' : 'p-5 gap-3 shadow-sm'
  );

  if (steps.length === 0) {
    const canGenerate = subtasksTotal === 0 && !!onGenerateSteps;
    return (
      <section className={cardClass} aria-label="Task steps" aria-busy={isGeneratingSteps}>
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" aria-hidden />
        <p className="text-sm text-muted-foreground pl-2">
          {subtasksTotal > 0
            ? `${subtasksCompleted} of ${subtasksTotal} subtasks done`
            : canGenerate
              ? 'No steps yet. Want a few small ones to get started?'
              : 'No steps for this task — just focus on getting it done.'}
        </p>
        {canGenerate && (
          <button
            type="button"
            onClick={onGenerateSteps}
            disabled={isGeneratingSteps}
            className="ml-2 self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Sparkles className={cn('w-4 h-4', isGeneratingSteps && 'animate-pulse')} />
            {isGeneratingSteps ? 'Breaking it down...' : 'Break it down with AI'}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass} aria-label="Task steps">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" aria-hidden />

      <div className="flex items-center justify-between pl-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {allDone ? 'All steps done' : `Step ${doneCount + 1} of ${steps.length}`}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {doneCount}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="ml-2 h-1.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        aria-label="Steps completed"
      >
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-300"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Current step, front and center */}
      {current ? (
        <div className="pl-2 flex flex-col gap-3">
          <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
            {current.content}
          </p>
          <button
            type="button"
            onClick={() => onToggleStep(current)}
            disabled={pendingStepId === current.id}
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {pendingStepId === current.id ? 'Saving...' : 'Done, next step'}
          </button>
        </div>
      ) : (
        <p className="pl-2 text-sm text-foreground">
          Nice work — every step is checked off. Mark the task complete when you're ready.
        </p>
      )}

      {/* Full checklist */}
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="pl-2 self-start inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAll && 'rotate-180')} />
        {showAll ? 'Hide all steps' : 'Show all steps'}
      </button>

      {showAll && (
        <ol className="pl-2 flex flex-col gap-1">
          {steps.map((step) => (
            <li key={step.id}>
              <label
                className={cn(
                  'flex items-start gap-2.5 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-muted/60 transition-colors',
                  step.id === current?.id && 'bg-muted/40'
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={step.is_completed}
                  disabled={pendingStepId === step.id}
                  onChange={() => onToggleStep(step)}
                />
                <span
                  className="mt-0.5 shrink-0 text-muted-foreground peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary rounded-full"
                  aria-hidden
                >
                  {step.is_completed ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </span>
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    step.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                >
                  {step.content}
                </span>
              </label>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
