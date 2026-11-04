import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Zap,
  Trophy,
  Plus,
  Brain,
  Sparkles,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Task } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { AccessibilityPanel } from "@/components/dashboard/AccessibilityPanel";
import { ZenButton } from "@/components/dashboard/ZenButton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, normalizeTasks } from "@/lib/api";

export function ADHDDashboard() {
  const navigate = useNavigate();
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
        title: "Momentum +1",
        description: "Task completed successfully",
      });
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;
    try {
      await apiRequest("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: quickTask.trim(),
          estimated_minutes: 25,
          priority: "HIGH",
        }),
      });
      setQuickTask("");
      await refreshTasks();
      toast({
        title: "Task Captured",
        description: "Added to your focus stream",
      });
    } catch (err) {
      console.error("Failed to quick add", err);
    }
  };

  const handleAISubmit = async () => {
    if (!aiQuery.trim()) return;
    try {
      const res = await apiRequest("/ai/parse-task", {
        method: "POST",
        body: JSON.stringify({ text: aiQuery.trim() }),
      });
      if (res.title) {
        await apiRequest("/tasks/", {
          method: "POST",
          body: JSON.stringify({
            title: res.title,
            description: res.description || null,
            estimated_minutes: res.estimated_minutes || 25,
            priority: res.priority || "HIGH",
          }),
        });
        setAiQuery("");
        setShowAI(false);
        await refreshTasks();
      }
    } catch (err) {
      console.error("AI parse failed", err);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-base font-medium text-primary">
          Preparing your focus stream...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-background text-foreground transition-all duration-300 ${
        accessibility.zenMode ? "p-4" : ""
      }`}
    >
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 ${
          accessibility.zenMode ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`font-semibold text-foreground ${fontSizeClass}`}>
                Good day, {user?.name || 'there'}
              </h1>
              <p className="text-xs text-muted-foreground">
                One task at a time. No distractions.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl bg-card border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* QUICK ADD + AI (hidden in Zen) */}
        {!accessibility.zenMode && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 flex gap-2 shadow-soft">
              <input
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="Capture a thought before it slips..."
                className="flex-1 bg-background px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(); }}
              />
              <button
                onClick={handleQuickAdd}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus size={15} /> Add
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Brain size={15} className="text-primary" /> AI Task Breakdown
                </h3>
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {showAI ? "Close" : "Open Assistant"}
                </button>
              </div>

              {showAI && (
                <div className="flex gap-2 mt-3 animate-fade-in">
                  <input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. Study chapter 4 for exam"
                    className="flex-1 bg-background px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAISubmit(); }}
                  />
                  <button
                    onClick={handleAISubmit}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles size={14} /> Parse
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {/* Calm Focus Session Launcher */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Current Session
                </span>
                <span className="text-xs text-primary font-medium">ADHD Flow</span>
              </div>
              <p className="text-sm text-foreground">
                Ready to dive in? Start a progressive focus session without time pressure.
              </p>
              <button
                onClick={() => navigate('/focus')}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-2 text-xs shadow-glow-vermilion transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Focus Mode
              </button>
            </div>

            <ProgressStats
              completed={completedCount}
              total={tasks.length}
            />
          </div>

          <div className="lg:col-span-2">
            {tasks.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-soft">
                <h2 className="text-lg font-semibold mb-2 text-foreground">
                  Your slate is clean 🌿
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Use Quick Add above to capture your next priority task.
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
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    className="bg-card border border-primary/30 rounded-2xl p-8 text-center text-foreground shadow-soft"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold mb-1">
                      Focus stream clear
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      You finished all {tasks.length} active tasks. Enjoy the moment.
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
