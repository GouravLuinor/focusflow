import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Heart, Check, Brain } from "lucide-react";
import { normalizeTasks, apiRequest } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { ZenButton } from "@/components/dashboard/ZenButton";
import { AccessibilityPanel } from "@/components/dashboard/AccessibilityPanel";
import type { Task } from "@/contexts/AppContext";

export function AutismDashboard() {
  const {
    tasks,
    setTasks,
    currentTaskIndex,
    setCurrentTaskIndex,
    user,
    accessibility,
    setAccessibility,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [quickTask, setQuickTask] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [showAI, setShowAI] = useState(false);

  /* =========================
     LOAD TASKS
  ========================== */
  const loadTasks = async () => {
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
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* =========================
     REFRESH TASKS
  ========================== */
  const refreshTasks = async () => {
    const updated = await apiRequest("/tasks/");
    const normalized = normalizeTasks(updated);

    setTasks(normalized);

    const nextIndex = normalized.findIndex(
      (t: Task) => !t.completed
    );

    setCurrentTaskIndex(nextIndex !== -1 ? nextIndex : 0);
  };

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

  const currentTask = tasks[currentTaskIndex];

  return (
    <div
      className={`min-h-screen bg-autism-muted mode-autism transition-colors duration-500 ${
        accessibility.highContrast ? "high-contrast" : ""
      }`}
    >
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`sticky top-0 bg-autism-muted/90 backdrop-blur-sm border-b border-autism-primary/10 z-30 transition-opacity duration-500 ${
          accessibility.zenMode ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-autism-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-autism-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                Hello, {user?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Focus on one thing at a time
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-autism-secondary hover:bg-autism-primary/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-autism-primary" />
          </button>
        </div>
      </motion.header>

      {/* MAIN */}
      <main
        className={`max-w-2xl mx-auto px-4 transition-all duration-500 ${
          accessibility.zenMode ? "py-24" : "py-12"
        }`}
      >
        {/* QUICK ADD */}
        {!accessibility.zenMode && (
          <div className="bg-white rounded-2xl shadow-lg p-5 flex gap-3 mb-6">
            <input
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-4 py-3 rounded-xl border"
            />
            <button
              onClick={handleQuickAdd}
              className="px-5 bg-autism-primary text-white rounded-xl"
            >
              Add
            </button>
          </div>
        )}

        {/* AI PANEL */}
        {!accessibility.zenMode && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain size={16} />
                Need help breaking it down?
              </h3>
              <button
                onClick={() => setShowAI(!showAI)}
                className="text-autism-primary"
              >
                {showAI ? "Hide" : "Ask AI"}
              </button>
            </div>

            {showAI && (
              <div className="flex gap-3">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Example: Study science"
                  className="flex-1 px-4 py-3 rounded-xl border"
                />
                <button
                  onClick={handleAISubmit}
                  className="px-5 bg-autism-primary text-white rounded-xl"
                >
                  Go
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div
          className={`flex justify-center gap-3 mb-8 transition-opacity duration-500 ${
            accessibility.zenMode ? "opacity-0" : ""
          }`}
        >
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                task.completed
                  ? "bg-autism-primary text-white"
                  : index === currentTaskIndex
                  ? "bg-autism-primary/20 border-2 border-autism-primary"
                  : "bg-autism-secondary"
              }`}
            >
              {task.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium text-autism-primary">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* TASK CARD */}
        <AnimatePresence mode="wait">
          {currentTask && !currentTask.completed ? (
            <TaskCard
              key={currentTask.id}
              task={currentTask}
              onComplete={handleCompleteTask}
              onRefresh={refreshTasks}
              variant="autism"
            />
          ) : (
            <div className="bg-autism-secondary rounded-3xl p-10 text-center border border-autism-primary/20">
              <Check className="w-8 h-8 mx-auto mb-4 text-autism-primary" />
              <h2 className="text-2xl font-semibold">
                All tasks complete
              </h2>
            </div>
          )}
        </AnimatePresence>

        {accessibility.zenMode && (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            Focus only on this step.
          </div>
        )}
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
