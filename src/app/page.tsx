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
import {
  useClientLearningStore,
  type LearningModule,
  type User,
  type Level,
  type Achievement,
  type Lesson,
} from "@/store/client-store";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Mock data for demonstration
const mockModules: LearningModule[] = [
  {
    id: "1",
    title: "Vocabulario Técnico Esencial",
    description:
      "Aprende los términos más importantes usados en desarrollo de software",
    type: "VOCABULARY",
    level: "BEGINNER",
    isPremium: false,
    order: 1,
    icon: "📚",
    lessons: [
      {
        id: "1-1",
        moduleId: "1",
        title: "Introducción al Vocabulario Técnico",
        content: "",
        type: "MULTIPLE_CHOICE",
        level: "BEGINNER",
        duration: 15,
        order: 1,
        isPublished: true,
      },
      {
        id: "1-2",
        moduleId: "1",
        title: "Bases de Datos y Almacenamiento",
        content: "",
        type: "MULTIPLE_CHOICE",
        level: "BEGINNER",
        duration: 20,
        order: 2,
        isPublished: true,
      },
    ],
    progress: {
      id: "progress-1",
      userId: "user-1",
      moduleId: "1",
      status: "IN_PROGRESS",
      score: 75,
      timeSpent: 1200,
      attempts: 2,
      bestScore: 85,
    },
  },
  {
    id: "2",
    title: "Comunicación en Code Reviews",
    description: "Aprende a dar y recibir feedback constructivo en inglés",
    type: "SPEAKING",
    level: "INTERMEDIATE",
    isPremium: true,
    order: 2,
    icon: "💬",
    lessons: [
      {
        id: "2-1",
        moduleId: "2",
        title: "Feedback Positivo y Constructivo",
        content: "",
        type: "SPEAKING_PRACTICE",
        level: "INTERMEDIATE",
        duration: 25,
        order: 1,
        isPublished: true,
      },
    ],
  },
  {
    id: "3",
    title: "Gramática para Programadores",
    description: "Conceptos gramaticales aplicados a la documentación técnica",
    type: "GRAMMAR",
    level: "BEGINNER",
    isPremium: false,
    order: 3,
    icon: "📝",
    lessons: [],
    progress: {
      id: "progress-3",
      userId: "user-1",
      moduleId: "3",
      status: "COMPLETED",
      score: 95,
      timeSpent: 2400,
      attempts: 1,
      bestScore: 95,
      completedAt: new Date().toISOString(),
    },
  },
  {
    id: "4",
    title: "Reading Comprehension Técnica",
    description: "Mejora tu comprensión de documentación y artículos técnicos",
    type: "READING",
    level: "INTERMEDIATE",
    isPremium: false,
    order: 4,
    icon: "📖",
    lessons: [
      {
        id: "4-1",
        moduleId: "4",
        title: "Leyendo Documentación de APIs",
        content: "",
        type: "LISTENING_COMPREHENSION",
        level: "INTERMEDIATE",
        duration: 30,
        order: 1,
        isPublished: true,
      },
    ],
  },
];

const mockUser: User = {
  id: "user-1",
  email: "developer@techenglish.com",
  name: "Alex Developer",
  level: "INTERMEDIATE",
  nativeLang: "es",
  totalXP: 450,
  streak: 7,
  lastActive: new Date().toISOString(),
};

const mockExercises = [
  {
    id: "ex-1",
    lessonId: "1-1",
    question:
      'What is the correct term for "a variable that can hold different data types"?',
    type: "MULTIPLE_CHOICE" as const,
    options: ["Static variable", "Dynamic variable", "Constant", "Array"],
    correctAnswer: "Dynamic variable",
    explanation:
      "A dynamic variable can hold different data types during runtime, which is common in languages like JavaScript or Python.",
    hints: [
      "Think about variables that can change their type",
      "Consider languages like JavaScript",
    ],
    difficulty: 2,
    order: 1,
  },
  {
    id: "ex-2",
    lessonId: "1-1",
    question:
      'Complete the sentence: "The function _____ an error when input is invalid."',
    type: "FILL_BLANK" as const,
    correctAnswer: "throws",
    explanation:
      'In programming, we commonly say a function "throws" an error when encountering invalid input.',
    hints: ["Think about error handling terminology", "What do exceptions do?"],
    difficulty: 1,
    order: 2,
  },
];

type ViewType = "dashboard" | "progress" | "lesson" | "settings";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(
    null
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const store = useClientLearningStore();

  // Safely access store properties
  const user = store.user;
  const isAuthenticated = store.isAuthenticated;
  const exercises = store.exercises;

  // Type assertion for store actions - they exist when store is loaded
  const storeWithActions = store as any;
  const setUser = storeWithActions.setUser || (() => {});
  const setAuthenticated = storeWithActions.setAuthenticated || (() => {});
  const setModules = storeWithActions.setModules || (() => {});
  const setAchievements = storeWithActions.setAchievements || (() => {});
  const setCurrentLevel = storeWithActions.setCurrentLevel || (() => {});
  const setExercises = storeWithActions.setExercises || (() => {});

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const hasCompletedOnboarding =
        typeof window !== "undefined"
          ? localStorage.getItem("hasCompletedOnboarding")
          : null;

      if (hasCompletedOnboarding) {
        try {
          setUser(mockUser);
          setAuthenticated(true);
          setModules(mockModules);
          setExercises(mockExercises);
          setCurrentLevel(mockUser.level);

          setAchievements([
            {
              id: "ach-1",
              title: "Primeros Pasos",
              description: "Completa tu primera lección",
              icon: "🎯",
              badgeColor: "green",
              xpReward: 50,
              condition: "complete_first_lesson",
              unlockedAt: new Date().toISOString(),
            },
            {
              id: "ach-2",
              title: "En Racha",
              description: "Mantén una racha de 7 días",
              icon: "🔥",
              badgeColor: "orange",
              xpReward: 100,
              condition: "streak_7_days",
              unlockedAt: new Date().toISOString(),
            },
            {
              id: "ach-3",
              title: "Vocabulary Master",
              description: "Completa el módulo de vocabulario",
              icon: "📚",
              badgeColor: "blue",
              xpReward: 150,
              condition: "complete_vocabulary_module",
            },
          ]);
        } catch (error) {
          console.error("Error loading user data:", error);
          // Set error state if needed
        }
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, [
    setUser,
    setAuthenticated,
    setModules,
    setAchievements,
    setCurrentLevel,
    setExercises,
  ]);

  const handleOnboardingComplete = (userData: {
    name: string;
    email: string;
    level: Level;
  }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      level: userData.level,
      nativeLang: "es",
      totalXP: 0,
      streak: 0,
      lastActive: new Date().toISOString(),
    };

    setUser(newUser);
    setAuthenticated(true);
    setCurrentLevel(userData.level);
    setModules(
      mockModules.filter(
        (m) => m.level === userData.level || m.level === "BEGINNER"
      )
    );
    setExercises(mockExercises);

    // Safely set localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hasCompletedOnboarding", "true");
      } catch (error) {
        console.error("Failed to save onboarding status:", error);
      }
    }
  };

  const handleModuleSelect = (module: LearningModule) => {
    setSelectedModule(module);
    if (module.lessons && module.lessons.length > 0) {
      setSelectedLesson(module.lessons[0]);
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
    setUser(null);
    setAuthenticated(false);

    // Safely remove from localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("hasCompletedOnboarding");
      } catch (error) {
        console.error("Failed to clear onboarding status:", error);
      }
    }

    setCurrentView("dashboard");
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
                {user?.name || "Developer"}
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
