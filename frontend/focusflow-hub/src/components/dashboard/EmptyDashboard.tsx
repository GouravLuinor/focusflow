import { useState } from 'react';
import { ClipboardList, BarChart3, Trophy, Plus, Sparkles } from 'lucide-react';
import { CreateGoalDialog } from './CreateGoalDialog';
import { CreateTaskDialog } from './CreateTaskDialog';
import { useApp } from '@/contexts/AppContext';

interface EmptyDashboardProps {
  name: string;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function EmptyDashboard({ name }: EmptyDashboardProps) {
  const { supportMode } = useApp();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const timeOfDay = getTimeOfDay();
  const firstName = name?.split(' ')[0] ?? 'there';

  const isADHD = supportMode === 'adhd';

  return (
    <div className={`p-6 md:p-8 flex flex-col ${isADHD ? 'max-w-3xl' : 'lg:flex-row'} gap-8 w-full h-full pb-32 md:pb-8 mt-4 md:mt-0`}>
      {/* LEFT / MAIN COLUMN: Greeting & Tasks */}
      <div className="flex-1 flex flex-col gap-6 animate-fade-in">
        {/* Header Section */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-none font-sans">
            Good {timeOfDay}, {firstName}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-sans">
            {isADHD
              ? "Here's your calm focus slate. What's the one thing you want to tackle today?"
              : "Here's your empty slate. Let's get things organized."}
          </p>
        </header>

        {/* Tasks Empty State */}
        <section className="flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-medium text-foreground font-sans">
              Your Tasks
            </h2>
          </div>

          {/* Empty State Container */}
          <div className="flex-1 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] transition-all duration-300 hover:shadow-soft relative overflow-hidden group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary border border-primary/20 shrink-0">
              <ClipboardList className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-medium text-foreground mb-2 font-sans">
              No tasks yet
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-6 font-sans leading-relaxed">
              {isADHD
                ? 'Create a small, manageable task to get into flow.'
                : 'Ready to start? Add your first task to see your personalized recommendations here.'}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                data-testid="create-task-btn"
                onClick={() => setShowCreateTask(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] duration-150 transition-all shadow-glow-vermilion text-xs font-sans"
              >
                <Plus className="w-4 h-4" />
                Create First Task
              </button>

              {isADHD && (
                <button
                  data-testid="create-goal-btn"
                  onClick={() => setShowCreateGoal(true)}
                  className="border border-border text-foreground hover:bg-secondary font-medium py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-sans"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  Set a Goal
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Goals & Stats (Hidden in ADHD mode to prevent overload) */}
      {!isADHD && (
        <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-6 animate-fade-in">
          {/* Quick Stats */}
          <section className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-soft">
            <h2 className="text-base font-medium text-foreground flex items-center gap-2 font-sans">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                <span className="text-3xl font-semibold text-muted-foreground/60 mb-1 font-sans leading-none">
                  0
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-sans">
                  Tasks Done
                </span>
              </div>
              <div className="bg-background rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                <span className="text-3xl font-semibold text-muted-foreground/60 mb-1 font-sans leading-none">
                  0h
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-sans">
                  Focus Time
                </span>
              </div>
            </div>
          </section>

          {/* Goals Empty State */}
          <section className="flex-1 flex flex-col">
            <h2 className="text-base font-medium text-foreground mb-3 font-sans">
              Current Goals
            </h2>
            <div
              data-testid="create-goal-btn"
              onClick={() => setShowCreateGoal(true)}
              className="flex-1 bg-card border border-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px] hover:border-primary/50 hover:bg-secondary/40 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-3 text-muted-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-200 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors font-sans">
                Create your first goal
              </h3>
              <p className="text-xs text-muted-foreground mb-4 font-sans max-w-[220px]">
                Set a milestone to track your progress and dependency chains.
              </p>
              <button
                data-testid="create-goal-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateGoal(true);
                }}
                className="border border-border text-foreground group-hover:border-primary group-hover:text-primary font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors text-xs font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                Set Goal
              </button>
            </div>
          </section>
        </div>
      )}

      <CreateGoalDialog
        open={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
      />

      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  );
}
