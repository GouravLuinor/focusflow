import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, BookOpen, Check, ArrowRight, Brain } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { AccessibilityPanel } from "@/components/dashboard/AccessibilityPanel";
import { ZenButton } from "@/components/dashboard/ZenButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, normalizeTasks } from "@/lib/api";
import type { Task } from "@/contexts/AppContext";

export function DyslexiaDashboard() {
  const {
    tasks,
    setTasks,
    currentTaskIndex,
    setCurrentTaskIndex,
    user,
    accessibility,
    setAccessibility,
  } = useApp();

  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [quickTask, setQuickTask] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [showAI, setShowAI] = useState(false);

  /* =========================
     REFRESH TASKS
  ========================== */
  const refreshTasks = useCallback(async () => {
    try {
      const data = await apiRequest("/tasks/");
      const normalized = normalizeTasks(data);

      setTasks(normalized);

      const nextIndex = normalized.findIndex(
        (t: Task) => !t.completed
      );

      setCurrentTaskIndex(nextIndex !== -1 ? nextIndex : 0);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  }, [setTasks, setCurrentTaskIndex]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const currentTask = tasks[currentTaskIndex];

  /* =========================
     COMPLETE TASK
  ========================== */
  const handleCompleteTask = async () => {
    const task = tasks[currentTaskIndex];
    if (!task) return;

    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          is_completed: true,
        }),
      });

      await refreshTasks();

      toast({
        title: "Great job! ✓",
        description: "Task completed successfully",
      });
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  /* =========================
     QUICK ADD
  ========================== */
  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;

    await apiRequest("/tasks/", {
      method: "POST",
      body: JSON.stringify({
        title: quickTask,
        description: "Quick added task",
      }),
    });

    setQuickTask("");
    await refreshTasks();
  };

  /* =========================
     AI BREAKDOWN
  ========================== */
  const handleAISubmit = async () => {
    if (!aiQuery.trim()) return;

    await apiRequest(
      `/ai/generate-steps?title=${encodeURIComponent(aiQuery)}`,
      { method: "POST" }
    );

    setAiQuery("");
    setShowAI(false);
    await refreshTasks();
  };

  /* =========================
     ZEN MODE
  ========================== */
  const toggleZenMode = () => {
    setAccessibility({
      ...accessibility,
      zenMode: !accessibility.zenMode,
    });
  };

  /* =========================
     ACCESSIBILITY STYLES
  ========================== */
  const fontSizeClass = `text-size-${accessibility.fontSize}`;

  const lineSpacingClass =
    accessibility.lineSpacing === "loose"
      ? "leading-loose"
      : accessibility.lineSpacing === "relaxed"
      ? "leading-relaxed"
      : "leading-normal";

  const letterSpacingClass =
    accessibility.letterSpacing === "wider"
      ? "tracking-widest"
      : accessibility.letterSpacing === "wide"
      ? "tracking-wide"
      : "tracking-normal";

  const dyslexiaFontClass = accessibility.dyslexiaFont
    ? "font-lexend"
    : "";

  const progressPercent =
    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div
      className={`min-h-screen bg-dyslexia-secondary/30 mode-dyslexia ${
        accessibility.highContrast ? "high-contrast" : ""
      } ${dyslexiaFontClass}`}
    >
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 bg-dyslexia-secondary/90 backdrop-blur-sm border-b-2 border-dyslexia-primary/30 z-30 ${
          accessibility.zenMode ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-dyslexia-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-dyslexia-text" />
            </div>
            <div>
              <h1 className={`font-bold ${fontSizeClass} ${letterSpacingClass}`}>
                Welcome, {user?.name}
              </h1>
              <p className={`text-base text-muted-foreground ${letterSpacingClass}`}>
                One step at a time
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-4 rounded-xl bg-dyslexia-primary/20 hover:bg-dyslexia-primary/30 transition-colors border-2 border-dyslexia-primary/30"
          >
            <Settings className="w-6 h-6 text-dyslexia-primary" />
          </button>
        </div>
      </motion.header>

      {/* QUICK ADD + AI */}
      {!accessibility.zenMode && (
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          <div className="flex gap-3">
            <input
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-4 py-3 rounded-xl border"
            />
            <button
              onClick={handleQuickAdd}
              className="px-5 bg-dyslexia-primary text-dyslexia-text rounded-xl"
            >
              Add
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowAI(!showAI)}
              className="text-dyslexia-primary flex items-center gap-2"
            >
              <Brain size={16} />
              {showAI ? "Hide AI" : "Ask AI"}
            </button>

            {showAI && (
              <div className="flex gap-3 mt-3">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Example: Study history"
                  className="flex-1 px-4 py-3 rounded-xl border"
                />
                <button
                  onClick={handleAISubmit}
                  className="px-5 bg-dyslexia-primary text-dyslexia-text rounded-xl"
                >
                  Go
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="max-w-3xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {currentTask && !currentTask.completed ? (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-3xl p-8 border-2 border-dyslexia-primary/30 shadow-lg"
            >
              <h2
                className={`text-3xl font-bold mb-6 ${fontSizeClass} ${lineSpacingClass} ${letterSpacingClass}`}
              >
                {currentTask.title}
              </h2>

              {/* =========================
                  STEPS SECTION
              ========================== */}
              {currentTask.steps && currentTask.steps.length > 0 && (
                <div className="space-y-4 mb-10">
                  {currentTask.steps.map((step) => (
                    <div
                      key={step.id}
                      onClick={async () => {
                        await apiRequest(
                          `/tasks/${currentTask.id}/steps/${step.id}`,
                          {
                            method: "PUT",
                            body: JSON.stringify({
                              is_completed: !step.completed,
                            }),
                          }
                        );
                        await refreshTasks();
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        step.completed
                          ? "bg-green-100 border-green-400 line-through"
                          : "bg-white border-dyslexia-primary/30"
                      } ${letterSpacingClass} ${lineSpacingClass}`}
                    >
                      {step.content}
                    </div>
                  ))}
                </div>
              )}

              {/* =========================
                  DONE BUTTON
                  Only enabled when:
                  - No steps
                  OR
                  - All steps completed
              ========================== */}
              {(!currentTask.steps.length ||
                currentTask.steps.every((s) => s.completed)) && (
                <motion.button
                  onClick={handleCompleteTask}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-6 bg-dyslexia-primary text-dyslexia-text rounded-2xl font-bold text-2xl flex items-center justify-center gap-4"
                >
                  <Check className="w-8 h-8" />
                  Done! Next step
                  <ArrowRight className="w-8 h-8" />
                </motion.button>
              )}
            </motion.div>

          ) : (
            <div className="bg-dyslexia-primary rounded-3xl p-12 text-center">
              <Check className="w-12 h-12 mx-auto mb-6 text-dyslexia-text" />
              <h2 className="text-3xl font-bold text-dyslexia-text">
                All Done!
              </h2>
            </div>
          )}
        </AnimatePresence>
      </main>

      <ZenButton
        isZenMode={accessibility.zenMode}
        onToggle={toggleZenMode}
      />

      <AnimatePresence>
        {showSettings && (
          <AccessibilityPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
