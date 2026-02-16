import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type SupportMode = "adhd" | "autism" | "dyslexia" | null;

export interface User {
  id?: number;
  email: string;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  order?: number;
  steps?: any[];
}

export interface AccessibilitySettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  highContrast: boolean;
  zenMode: boolean;

  // NEW FOR DYSLEXIA
  dyslexiaFont: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide' | 'wider';
}


interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  supportMode: SupportMode;
  setSupportMode: (mode: SupportMode) => void;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentTaskIndex: number;
  setCurrentTaskIndex: React.Dispatch<React.SetStateAction<number>>;
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: AccessibilitySettings) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supportMode, setSupportMode] = useState<SupportMode>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    fontSize: 'base',
    highContrast: false,
    zenMode: false,

    dyslexiaFont: true,
    lineSpacing: 'relaxed',
    letterSpacing: 'wide',
  });


  /* ---------------------------
     Apply accessibility styles
  ---------------------------- */

  useEffect(() => {
    const root = document.documentElement;

    /* ---------------- Font Size ---------------- */
    root.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
      "text-xl",
      "text-2xl"
    );
    root.classList.add(`text-${accessibility.fontSize}`);

    /* ---------------- High Contrast ---------------- */
    if (accessibility.highContrast) {
      root.classList.add("bg-black", "text-white");
    } else {
      root.classList.remove("bg-black", "text-white");
    }

    /* ---------------- Dyslexia Font ---------------- */
    if (accessibility.dyslexiaFont) {
      root.classList.add("font-lexend");
    } else {
      root.classList.remove("font-lexend");
    }

    /* ---------------- Line Spacing ---------------- */
    root.classList.remove("leading-normal", "leading-relaxed", "leading-loose");
    root.classList.add(`leading-${accessibility.lineSpacing}`);

    /* ---------------- Letter Spacing ---------------- */
    root.classList.remove("tracking-normal", "tracking-wide", "tracking-wider");
    root.classList.add(`tracking-${accessibility.letterSpacing}`);

  }, [accessibility]);


  /* ---------------------------
     Logout
  ---------------------------- */

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSupportMode(null);
    setOnboardingComplete(false);
    setTasks([]);
    setCurrentTaskIndex(0);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        supportMode,
        setSupportMode,
        isAuthenticated: user !== null,
        onboardingComplete,
        setOnboardingComplete,
        tasks,
        setTasks,
        currentTaskIndex,
        setCurrentTaskIndex,
        accessibility,
        setAccessibility,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
