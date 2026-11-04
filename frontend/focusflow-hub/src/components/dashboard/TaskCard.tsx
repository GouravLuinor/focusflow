import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Edit3, Trash2, Clock, CheckCircle2 } from "lucide-react";
import type { Task } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onRefresh: () => Promise<void>;
  variant?: "adhd" | "autism" | "dyslexia";
}

export function TaskCard({
  task,
  onComplete,
  onRefresh,
  variant = "adhd",
}: TaskCardProps) {
  const { accessibility } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const hasSteps = task.steps && task.steps.length > 0;
  const allStepsDone =
    hasSteps && task.steps!.every((step) => step.completed === true);

  const handleStepToggle = async (
    taskId: number,
    stepId: number,
    current: boolean
  ) => {
    try {
      await apiRequest(`/tasks/${taskId}/steps/${stepId}`, {
        method: "PUT",
        body: JSON.stringify({
          is_completed: !current,
        }),
      });

      await onRefresh();
    } catch (err) {
      console.error("Failed to update step", err);
    }
  };

  const buttonColor =
    variant === "autism"
      ? "bg-autism-primary hover:opacity-90"
      : variant === "dyslexia"
      ? "bg-dyslexia-primary text-foreground hover:opacity-90"
      : "bg-primary hover:bg-primary/90 text-primary-foreground";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card rounded-2xl border border-border overflow-hidden shadow-soft transition-all duration-300 flex font-sans ${
          accessibility.zenMode ? "shadow-medium scale-[1.01]" : ""
        }`}
      >
        {/* 3px Vermilion / State Strip */}
        <div className="w-1.5 bg-primary shrink-0" />

        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Header / Actions */}
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    Active Focus
                  </span>
                  {task.estimated_minutes && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      ~{task.estimated_minutes} min
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                  {task.title}
                </h2>
              </div>

              {/* Edit / Delete Icons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Edit Task"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Steps */}
            {hasSteps && (
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Micro-Steps
                </p>
                {task.steps!.map((step) => (
                  <div
                    key={step.id}
                    onClick={() =>
                      handleStepToggle(task.id, step.id, step.completed)
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      step.completed
                        ? "bg-success/10 border-success/30 text-muted-foreground line-through"
                        : "bg-background border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        step.completed
                          ? "bg-success border-success text-success-foreground"
                          : "border-border"
                      }`}
                    >
                      {step.completed && <Check size={12} />}
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complete Task CTA */}
          <div className="pt-4 border-t border-border/50 flex justify-end">
            <button
              onClick={onComplete}
              className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-150 shadow-glow-vermilion hover:scale-[1.02] active:scale-[0.98] ${buttonColor}`}
            >
              <CheckCircle2 size={18} />
              Mark Task Complete
            </button>
          </div>
        </div>
      </motion.div>

      <EditTaskDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        task={task}
        onDeleteRequest={() => {
          setShowEdit(false);
          setShowDelete(true);
        }}
      />

      <DeleteTaskDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        taskId={task.id}
        taskTitle={task.title}
      />
    </>
  );
}
