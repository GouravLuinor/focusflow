import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Zap,
  Trophy,
  Plus,
  Brain,
  Sparkles,
} from "lucide-react";

import type { Task } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { AccessibilityPanel } from "@/components/dashboard/AccessibilityPanel";
import { ZenButton } from "@/components/dashboard/ZenButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, normalizeTasks } from "@/lib/api";

export function ADHDDashboard() {
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
  const [loading, setLoading] = useState(true);

  /* =========================
     REFRESH TASKS (Single Source of Truth)
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
      console.error("Failed to refresh tasks", err);
    }
  }, [setTasks, setCurrentTaskIndex]);

  /* =========================
     LOAD ON MOUNT
  ========================== */
  useEffect(() => {
    const init = async () => {
      await refreshTasks();
      setLoading(false);
    };
    init();
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
        title: "🔥 Momentum +1",
        description: "Task saved successfully",
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

    try {
      await apiRequest("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: quickTask,
          description: "Quick added task",
        }),
      });

      setQuickTask("");
      await refreshTasks();

      toast({
        title: "⚡ Task added",
        description: "Saved to your focus session",
      });
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  /* =========================
     AI BREAKDOWN
  ========================== */
  const handleAISubmit = async () => {
    if (!aiQuery.trim()) return;

    try {
      await apiRequest(
        `/ai/generate-steps?title=${encodeURIComponent(aiQuery)}`,
        { method: "POST" }
      );

      setAiQuery("");
      setShowAI(false);
      await refreshTasks();

      toast({
        title: "🧠 AI Task Created",
        description: "Broken into steps automatically",
      });
    } catch (err) {
      console.error("AI failed", err);
    }
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

  const fontSizeClass = `text-size-${accessibility.fontSize}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg font-semibold text-orange-500">
          Loading your focus session...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen mode-adhd bg-gradient-adhd transition-all duration-300 ${
        accessibility.zenMode ? "bg-white" : ""
      }`}
    >
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 bg-white/70 backdrop-blur-lg border-b border-border z-30 ${
          accessibility.zenMode ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold ${fontSizeClass}`}>
                Hey {user?.name}! 🚀
              </h1>
              <p className="text-sm text-muted-foreground">
                Fast capture. Small wins. Big momentum.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-muted hover:bg-muted/80"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* QUICK ADD + AI (hidden in Zen) */}
        {!accessibility.zenMode && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-5 flex gap-3">
              <input
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="Quick add a task before you forget..."
                className="flex-1 px-4 py-3 rounded-xl border"
              />
              <button
                onClick={handleQuickAdd}
                className="px-5 rounded-xl bg-orange-500 text-white flex items-center gap-2"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Brain size={18} /> Need help breaking it down?
                </h3>
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="text-sm text-orange-500"
                >
                  {showAI ? "Hide" : "Ask AI"}
                </button>
              </div>

              {showAI && (
                <div className="flex gap-3">
                  <input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Example: Study machine learning"
                    className="flex-1 px-4 py-3 rounded-xl border"
                  />
                  <button
                    onClick={handleAISubmit}
                    className="px-5 bg-orange-500 text-white rounded-xl flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Go
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <CountdownTimer />
            <ProgressStats
              completed={completedCount}
              total={tasks.length}
            />
          </div>

          <div className="lg:col-span-2">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-orange-600">
                  No tasks yet 👀
                </h2>
                <p className="text-muted-foreground">
                  Use Quick Add or Ask AI to create your first task.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {currentTask && !currentTask.completed ? (
                  <TaskCard
                    key={currentTask.id}
                    task={currentTask}
                    onComplete={handleCompleteTask}
                    onRefresh={refreshTasks}
                    variant="adhd"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-orange-500 rounded-3xl p-10 text-center text-white"
                  >
                    <Trophy className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold">
                      Focus streak complete 🔥
                    </h2>
                    <p className="opacity-90 mt-3">
                      You finished all {tasks.length} tasks.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
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
