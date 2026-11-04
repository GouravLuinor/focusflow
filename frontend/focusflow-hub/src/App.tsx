import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider, useApp, getStoredAccessibility } from "./contexts/AppContext";
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

/** Sends signed-out visitors to /login instead of rendering a page that can't load. */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useApp();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function AppInitializer() {
  const { setUser, setSupportMode, setOnboardingComplete, setAccessibility } = useApp();
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

        // Fetch profile to sync support mode and accessibility settings
        try {
          const profile = await apiRequest("/profile/me");
          const mode = profile.support_mode === "none" ? null : profile.support_mode;
          setSupportMode(mode);
          setOnboardingComplete(profile.onboarding_completed);
          
          setAccessibility(getStoredAccessibility(mode));
        } catch (profileErr) {
          console.error("Failed to restore profile:", profileErr);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, [setUser, setSupportMode, setOnboardingComplete, setAccessibility]);

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
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/focus" element={<RequireAuth><FocusMode /></RequireAuth>} />
        <Route path="/focus/:taskId" element={<RequireAuth><FocusMode /></RequireAuth>} />
        <Route path="/goal/:goalId" element={<RequireAuth><GoalDetail /></RequireAuth>} />
        <Route path="/schedule" element={<RequireAuth><ScheduleView /></RequireAuth>} />
        <Route path="/insights" element={<RequireAuth><Insights /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
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
        <AppInitializer />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
