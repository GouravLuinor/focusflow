import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider, useApp, getStoredAccessibility } from "./contexts/AppContext";
import { apiRequest } from "@/lib/api";

import { AppLoader } from "@/components/shared/AppLoader";

// Route-level code splitting: each page is fetched the first time it's visited.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FocusMode = lazy(() => import("./pages/FocusMode"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const ScheduleView = lazy(() => import("./pages/ScheduleView"));
const Insights = lazy(() => import("./pages/Insights"));
const Settings = lazy(() => import("./pages/Settings"));

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
    return <AppLoader label="Restoring your session" />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoader />}>
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
      </Suspense>
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
