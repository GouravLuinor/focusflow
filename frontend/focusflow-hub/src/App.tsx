import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider, useApp } from "./contexts/AppContext";
import { apiRequest } from "@/lib/api";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { DyslexiaDashboard } from "./components/dashboard/DyslexiaDashboard";
import { AutismDashboard } from "./components/dashboard/AutismDashboard";
import { ADHDDashboard } from "./components/dashboard/ADHDDashboard";

const queryClient = new QueryClient();

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
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/adhd" element={<ADHDDashboard />} />
        <Route path="/autism" element={<AutismDashboard />} />
        <Route path="/dyslexia" element={<DyslexiaDashboard />} />
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
