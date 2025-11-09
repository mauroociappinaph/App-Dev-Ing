"use client";

// Types
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ModuleType =
  | "VOCABULARY"
  | "GRAMMAR"
  | "READING"
  | "LISTENING"
  | "SPEAKING"
  | "WRITING";
export type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_BLANK"
  | "TRANSLATION"
  | "LISTENING_COMPREHENSION"
  | "SPEAKING_PRACTICE"
  | "CODE_REVIEW"
  | "EMAIL_WRITING"
  | "MEETING_SIMULATION";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  level: Level;
  nativeLang: string;
  totalXP: number;
  streak: number;
  lastActive: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  level: Level;
  isPremium: boolean;
  order: number;
  icon?: string;
  lessons?: Lesson[];
  progress?: UserProgress;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  type: ExerciseType;
  level: Level;
  duration: number;
  order: number;
  isPublished: boolean;
  exercises?: Exercise[];
  progress?: UserProgress;
}

export interface Exercise {
  id: string;
  lessonId: string;
  question: string;
  type: ExerciseType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hints?: string[];
  difficulty: number;
  order: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId?: string;
  lessonId?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
  score?: number;
  timeSpent: number;
  attempts: number;
  bestScore?: number;
  completedAt?: string;
}

export interface ExerciseResponse {
  id: string;
  userId: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  feedback?: string;
  timeSpent: number;
  hintsUsed: number;
  sessionId?: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  xpEarned: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  responses: ExerciseResponse[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
  xpReward: number;
  condition: string;
  unlockedAt?: string;
}

// Store interface
interface LearningStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Learning state
  currentLevel: Level;
  selectedModule: LearningModule | null;
  currentLesson: Lesson | null;
  currentSession: LearningSession | null;

  // Progress state
  userProgress: UserProgress[];
  modules: LearningModule[];
  achievements: Achievement[];
  exercises: Exercise[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setCurrentLevel: (level: Level) => void;
  setSelectedModule: (module: LearningModule | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  setCurrentSession: (session: LearningSession | null) => void;
  setModules: (modules: LearningModule[]) => void;
  setUserProgress: (progress: UserProgress[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setExercises: (exercises: Exercise[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Learning actions
  startLearningSession: () => string;
  endLearningSession: () => void;
  updateProgress: (progress: UserProgress) => void;
  addExerciseResponse: (response: ExerciseResponse) => void;
  unlockAchievement: (achievement: Achievement) => void;
  calculateXP: (responses: ExerciseResponse[]) => number;

  // Utility actions
  resetStore: () => void;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  currentLevel: "BEGINNER" as Level,
  selectedModule: null,
  currentLesson: null,
  currentSession: null,
  userProgress: [],
  modules: [],
  achievements: [],
  exercises: [],
  isLoading: false,
  error: null,
};

// SSR-safe storage engine
const createNoopStorage = () => {
  return {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null,
  };
};

// Client-side storage engine
const createClientStorage = (): any => {
  if (typeof window === "undefined") {
    return createNoopStorage();
  }

  return {
    getItem: (name: string) => {
      try {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: any) => {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch {
        // Ignore errors in SSR or when localStorage is not available
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore errors in SSR or when localStorage is not available
      }
    },
  };
};

// Import Zustand synchronously - this is safe because we're in a "use client" file
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create the store with conditional persistence
const useClientStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setCurrentLevel: (currentLevel) => set({ currentLevel }),
      setSelectedModule: (selectedModule) => set({ selectedModule }),
      setCurrentLesson: (currentLesson) => set({ currentLesson }),
      setCurrentSession: (currentSession) => set({ currentSession }),
      setModules: (modules) => set({ modules }),
      setUserProgress: (userProgress) => set({ userProgress }),
      setAchievements: (achievements) => set({ achievements }),
      setExercises: (exercises) => set({ exercises }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Learning actions
      startLearningSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const session: LearningSession = {
          id: sessionId,
          userId: get().user?.id || "",
          startTime: new Date().toISOString(),
          xpEarned: 0,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          responses: [],
        };
        set({ currentSession: session });
        return sessionId;
      },

      endLearningSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const endTime = new Date().toISOString();
        const duration = Math.floor(
          (new Date(endTime).getTime() -
            new Date(currentSession.startTime).getTime()) /
            1000
        );

        const updatedSession = {
          ...currentSession,
          endTime,
          duration,
          xpEarned: get().calculateXP(currentSession.responses),
        };

        set({ currentSession: updatedSession });

        // Update user XP
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            totalXP: user.totalXP + updatedSession.xpEarned,
            lastActive: endTime,
          };
          set({ user: updatedUser });
        }

        return updatedSession;
      },

      updateProgress: (progress) => {
        const { userProgress } = get();
        const existingIndex = userProgress.findIndex(
          (p) =>
            (p.moduleId && p.moduleId === progress.moduleId) ||
            (p.lessonId && p.lessonId === progress.lessonId)
        );

        if (existingIndex >= 0) {
          userProgress[existingIndex] = progress;
        } else {
          userProgress.push(progress);
        }

        set({ userProgress: [...userProgress] });
      },

      addExerciseResponse: (response) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
          ...currentSession,
          responses: [...currentSession.responses, response],
          exercisesCompleted: currentSession.exercisesCompleted + 1,
        };

        set({ currentSession: updatedSession });
      },

      unlockAchievement: (achievement) => {
        const { achievements, user } = get();
        const existingAchievement = achievements.find(
          (a) => a.id === achievement.id
        );

        if (!existingAchievement) {
          const newAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
          };
          set({ achievements: [...achievements, newAchievement] });

          // Update user XP with achievement reward
          if (user) {
            const updatedUser = {
              ...user,
              totalXP: user.totalXP + achievement.xpReward,
            };
            set({ user: updatedUser });
          }
        }
      },

      calculateXP: (responses) => {
        return responses.reduce((total, response) => {
          let xp = 0;
          if (response.isCorrect) {
            xp = 10; // Base XP for correct answer
            xp += Math.max(0, 5 - response.hintsUsed) * 2; // Bonus for fewer hints
            xp += Math.max(0, 60 - response.timeSpent); // Bonus for speed
          }
          return total + xp;
        }, 0);
      },

      resetStore: () => set(initialState),
    }),
    {
      name: "learning-store",
      storage: createClientStorage(),
      // Skip hydration to avoid SSR issues
      skipHydration: true,
    }
  )
);

// Export the client-side store hook
export const useClientLearningStore = useClientStore;

// Selectors for common use cases - these are now simple hooks that return the store state
export const useUser = () => {
  const store = useClientLearningStore();
  return store.user;
};

export const useIsAuthenticated = () => {
  const store = useClientLearningStore();
  return store.isAuthenticated;
};

export const useCurrentLevel = () => {
  const store = useClientLearningStore();
  return store.currentLevel;
};

export const useSelectedModule = () => {
  const store = useClientLearningStore();
  return store.selectedModule;
};

export const useCurrentLesson = () => {
  const store = useClientLearningStore();
  return store.currentLesson;
};

export const useCurrentSession = () => {
  const store = useClientLearningStore();
  return store.currentSession;
};

export const useModules = () => {
  const store = useClientLearningStore();
  return store.modules;
};

export const useUserProgress = () => {
  const store = useClientLearningStore();
  return store.userProgress;
};

export const useAchievements = () => {
  const store = useClientLearningStore();
  return store.achievements;
};

export const useExercises = () => {
  const store = useClientLearningStore();
  return store.exercises;
};

export const useIsLoading = () => {
  const store = useClientLearningStore();
  return store.isLoading;
};

export const useError = () => {
  const store = useClientLearningStore();
  return store.error;
};

// Computed selectors
export const useModulesByLevel = (level: Level) => {
  const store = useClientLearningStore();
  return store.modules.filter((module) => module.level === level);
};

export const useModuleProgress = (moduleId: string) => {
  const store = useClientLearningStore();
  return store.userProgress.find((p) => p.moduleId === moduleId);
};

export const useLessonProgress = (lessonId: string) => {
  const store = useClientLearningStore();
  return store.userProgress.find((p) => p.lessonId === lessonId);
};

export const useTotalXP = () => {
  const store = useClientLearningStore();
  return store.user?.totalXP || 0;
};

export const useStreak = () => {
  const store = useClientLearningStore();
  return store.user?.streak || 0;
};
