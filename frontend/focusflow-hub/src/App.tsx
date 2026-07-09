import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider, useApp } from "./contexts/AppContext";
import { apiRequest } from "@/lib/api";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FocusMode from "./pages/FocusMode";
import GoalDetail from "./pages/GoalDetail";
import ScheduleView from "./pages/ScheduleView";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function HomeRoute() {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function AppInitializer() {
  const { setUser } = useApp();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const user = await apiRequest("/auth/me");
        setUser(user);
      } catch {
        localStorage.removeItem("token");
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, [setUser]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/focus" element={<FocusMode />} />
        <Route path="/focus/:taskId" element={<FocusMode />} />
        <Route path="/goals/:goalId" element={<GoalDetail />} />
        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppInitializer />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
