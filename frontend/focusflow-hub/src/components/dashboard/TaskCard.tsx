import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Task } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";

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

  const hasSteps = task.steps && task.steps.length > 0;

  const allStepsDone =
    hasSteps &&
    task.steps!.every((step) => step.completed === true);

  /* =========================
     STEP TOGGLE
  ========================== */
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

  /* =========================
     Mode-based button color
  ========================== */
  const buttonColor =
    variant === "autism"
      ? "bg-autism-primary"
      : variant === "dyslexia"
      ? "bg-dyslexia-primary"
      : "bg-orange-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 ${
        accessibility.zenMode ? "shadow-2xl scale-[1.02]" : ""
      }`}
    >
      {/* Title */}
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>

      {/* Description */}
      {task.description && (
        <p className="text-muted-foreground mb-6">
          {task.description}
        </p>
      )}

      {/* Steps */}
      {hasSteps && (
        <div className="space-y-3 mb-6">
          {task.steps!.map((step) => (
            <div
              key={step.id}
              onClick={() =>
                handleStepToggle(task.id, step.id, step.completed)
              }
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                step.completed
                  ? "bg-green-50 border-green-300"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : ""
                }`}
              >
                {step.completed && <Check size={14} />}
              </div>

              <span
                className={`flex-1 ${
                  step.completed
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {step.content}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Complete Task Button */}
      {!hasSteps || allStepsDone ? (
        <button
          onClick={onComplete}
          className={`w-full py-4 rounded-xl text-white font-semibold transition ${buttonColor}`}
        >
          Done! Next Step →
        </button>
      ) : (
        <div className="text-sm text-muted-foreground">
          Complete all steps to finish this task
        </div>
      )}
    </motion.div>
  );
}
