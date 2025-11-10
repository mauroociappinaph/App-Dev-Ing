import { useState, useEffect, useCallback } from "react";

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    filters?: Record<string, any>;
    includes?: Record<string, boolean>;
  };
}

// Generic API hook
export function useApi<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    params?: Record<string, any>;
    enabled?: boolean;
    dependencies?: any[];
  } = {}
) {
  const {
    method = "GET",
    body,
    params,
    enabled = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Build URL with params
      const url = new URL(endpoint, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "API request failed");
      }

      setData(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, body, params, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Specific hooks for our APIs

// Levels API
export interface Level {
  id: string;
  code: string;
  name: string;
  description?: string;
  order: number;
  prerequisites: string[];
  estimatedHours: number;
}

export function useLevels() {
  return useApi<Level[]>("/api/v1/public/levels");
}

export function useLevel(code: string) {
  return useApi<Level>(`/api/v1/public/levels/${code}`);
}

// Modules API
export interface Module {
  id: string;
  title: string;
  description?: string;
  type: string;
  order: number;
  estimatedMinutes: number;
  skills: string[];
  prerequisites: string[];
  isPremium: boolean;
  level: {
    id: string;
    code: string;
    name: string;
  };
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content?: any;
  type: string;
  level: string;
  duration: number;
  difficulty: number;
  order: number;
  isPublished: boolean;
  module?: {
    title: string;
  };
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  question: string;
  type: string;
  correctAnswer?: any;
  explanation?: string;
  hints: string[];
  difficulty: number;
  xpReward: number;
  order: number;
}

export function useModules(
  options: {
    levelCode?: string;
    includeLessons?: boolean;
  } = {}
) {
  const params: Record<string, any> = {};
  if (options.levelCode) params.levelCode = options.levelCode;
  if (options.includeLessons) params.includeLessons = "true";

  return useApi<Module[]>("/api/v1/public/modules", { params });
}

export function useModule(id: string) {
  return useApi<Module>(`/api/v1/public/modules/${id}`);
}

// Lessons API
export function useLessons(
  options: {
    moduleId?: string;
    levelCode?: string;
    includeExercises?: boolean;
  } = {}
) {
  const params: Record<string, any> = {};
  if (options.moduleId) params.moduleId = options.moduleId;
  if (options.levelCode) params.levelCode = options.levelCode;
  if (options.includeExercises) params.includeExercises = "true";

  return useApi<Lesson[]>("/api/v1/public/lessons", { params });
}

export function useLesson(id: string) {
  return useApi<Lesson>(`/api/v1/public/lessons/${id}`);
}

// Progress API (requires authentication)
export interface UserProgress {
  id: string;
  levelId?: string;
  moduleId?: string;
  lessonId?: string;
  exerciseId?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
  score?: number;
  timeSpent: number;
  attempts: number;
  bestScore?: number;
  completedAt?: string;
  xpEarned: number;
  level?: Level;
  module?: Module;
  lesson?: Lesson;
}

export interface ProgressStats {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  currentStreak: number;
  averageScore: number;
}

export interface UserProgressResponse {
  progress: UserProgress[];
  stats: ProgressStats;
  user: {
    id: string;
    level: string;
    totalXP: number;
    streak: number;
  };
}

export function useUserProgress() {
  return useApi<UserProgressResponse>("/api/v1/private/progress");
}

export function useUpdateProgress() {
  const [updating, setUpdating] = useState(false);

  const updateProgress = useCallback(
    async (data: {
      levelId?: string;
      moduleId?: string;
      lessonId?: string;
      exerciseId?: string;
      status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
      score?: number;
      timeSpent?: number;
      attempts?: number;
    }) => {
      setUpdating(true);
      try {
        const response = await fetch("/api/v1/private/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<{ xpEarned: number }> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to update progress");
        }

        return result.data;
      } catch (error) {
        console.error("Progress update error:", error);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  return {
    updateProgress,
    updating,
  };
}
