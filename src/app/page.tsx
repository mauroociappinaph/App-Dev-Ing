"use client";

import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/learning/onboarding";
import { LearningDashboard } from "@/components/learning/dashboard";
import { LessonPlayer } from "@/components/exercises/lesson-player";
import { ProgressDashboard } from "@/components/progress/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { type Module } from "@/hooks/use-api";
import { type LearningModule, type Lesson } from "@/store/client-store";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Note: Mock data removed - now using real API data from database

type ViewType = "dashboard" | "progress" | "lesson" | "settings";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(
    null
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and check authentication status
  useEffect(() => {
    setIsHydrated(true);

    const checkAuth = () => {
      const hasCompletedOnboarding = localStorage.getItem(
        "hasCompletedOnboarding"
      );
      setIsAuthenticated(!!hasCompletedOnboarding);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleOnboardingComplete = (userData: {
    name: string;
    email: string;
    level: string;
  }) => {
    // For now, just mark as authenticated
    // In a real app, this would create the user account
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hasCompletedOnboarding", "true");
      } catch (error) {
        console.error("Failed to save onboarding status:", error);
      }
    }
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module as any); // Temporary cast for compatibility
    if (module.lessons && module.lessons.length > 0) {
      setSelectedLesson(module.lessons[0] as any); // Temporary cast for compatibility
      setCurrentView("lesson");
    }
  };

  const handleLessonComplete = (
    lessonId: string,
    score: number,
    timeSpent: number
  ) => {
    console.log("Lesson completed:", { lessonId, score, timeSpent });
    // Navigate back to dashboard after lesson completion
    setCurrentView("dashboard");
  };

  const handleExitLesson = () => {
    setCurrentView("dashboard");
    setSelectedLesson(null);
    setSelectedModule(null);
  };

  const handleLogout = () => {
    // For now, just clear localStorage
    // In a real app with NextAuth, this would sign out the user
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("hasCompletedOnboarding");
      } catch (error) {
        console.error("Failed to clear onboarding status:", error);
      }
    }

    setCurrentView("dashboard");
    // Force a page reload to reset authentication state
    window.location.reload();
  };

  const renderNavigation = () => (
    <nav className="bg-card border-tech-muted sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-tech-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">
              TechEnglish Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentView("dashboard")}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Aprender
            </Button>
            <Button
              variant={currentView === "progress" ? "default" : "ghost"}
              onClick={() => setCurrentView("progress")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Progreso
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentView("settings")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-tech-accent bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-tech-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Developer
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-tech-muted">
            <div className="flex flex-col gap-2">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Aprender
              </Button>
              <Button
                variant={currentView === "progress" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentView("progress");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Progreso
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentView("settings");
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderContent = () => {
    // Don't render anything until hydrated to prevent hydration mismatch
    if (!isHydrated) {
      return (
        <div className="min-h-screen bg-tech-gradient-subtle flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-tech-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-foreground">
              Inicializando TechEnglish Pro...
            </h2>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    switch (currentView) {
      case "dashboard":
        return (
          <div className="container mx-auto px-4 py-8">
            <LearningDashboard onModuleSelect={handleModuleSelect} />
          </div>
        );

      case "progress":
        return (
          <div className="container mx-auto px-4 py-8">
            <ProgressDashboard />
          </div>
        );

      case "lesson":
        return selectedLesson ? (
          <LessonPlayer
            lesson={selectedLesson}
            onComplete={handleLessonComplete}
            onExit={handleExitLesson}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay lección seleccionada
                </h3>
                <p className="text-gray-600 mb-4">
                  Selecciona una lección desde el dashboard para comenzar.
                </p>
                <Button onClick={() => setCurrentView("dashboard")}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ir al Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "settings":
        return (
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuración
                </h3>
                <p className="text-gray-600">
                  Configuración de perfil y preferencias próximamente.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tech-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-tech-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold text-foreground">
            Cargando TechEnglish Pro...
          </h2>
          <p className="text-tech-muted">
            Si la app no carga, limpia el localStorage en:{" "}
            <a
              href="/api/clear-storage"
              className="text-tech-primary underline"
            >
              /api/clear-storage
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-tech-subtle">
        {isAuthenticated && renderNavigation()}
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
}
