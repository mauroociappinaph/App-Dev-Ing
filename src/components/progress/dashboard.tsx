"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Star,
  Flame,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import {
  useClientLearningStore,
  useTotalXP,
  useStreak,
  type Achievement,
  type UserProgress,
} from "@/store/client-store";

interface ProgressDashboardProps {
  onAchievementClick?: (achievement: Achievement) => void;
}

export function ProgressDashboard({
  onAchievementClick,
}: ProgressDashboardProps) {
  const { user, userProgress, achievements, modules } =
    useClientLearningStore();
  const totalXP = useTotalXP();
  const streak = useStreak();

  // Calculate statistics
  const completedLessons = userProgress.filter(
    (p) => p.status === "COMPLETED" && p.lessonId
  ).length;

  const completedModules = userProgress.filter(
    (p) => p.status === "COMPLETED" && p.moduleId
  ).length;

  const totalTimeSpent = userProgress.reduce(
    (total, p) => total + p.timeSpent,
    0
  );
  const scores = userProgress.filter((p) => p.score !== undefined);
  const averageScore =
    scores.length > 0
      ? scores.reduce((total, p) => total + (p.score || 0), 0) / scores.length
      : 0;

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const totalXPFromAchievements = unlockedAchievements.reduce(
    (total, a) => total + a.xpReward,
    0
  );

  // Recent activity (last 7 days)
  const recentProgress = userProgress.filter((p) => {
    if (!p.completedAt) return false;
    const completedDate = new Date(p.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate > weekAgo;
  });

  // Learning streak calculation
  const getStreakMessage = () => {
    if (streak === 0) return "Comienza tu racha hoy";
    if (streak === 1) return "¡Buen comienzo!";
    if (streak < 7) return "¡Sigue así!";
    if (streak < 30) return "¡Excelente consistencia!";
    return "¡Eres una leyenda!";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-500";
      case "INTERMEDIATE":
        return "bg-blue-500";
      case "ADVANCED":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {user?.name || "Developer"}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {user?.email} • Nivel {user?.level}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalXP}</div>
              <div className="text-blue-100">XP Total</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Flame className="w-6 h-6" />
                {streak}
              </div>
              <div className="text-sm text-blue-100">{getStreakMessage()}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedLessons}</div>
              <div className="text-sm text-blue-100">Lecciones Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedModules}</div>
              <div className="text-sm text-blue-100">Módulos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(averageScore)}%
              </div>
              <div className="text-sm text-blue-100">Puntaje Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </div>
            <div className="text-sm text-gray-600">Tiempo de Estudio</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Logros Desbloqueados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalXPFromAchievements}</div>
            <div className="text-sm text-gray-600">XP de Logros</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{recentProgress.length}</div>
            <div className="text-sm text-gray-600">Actividad esta semana</div>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Progreso por Módulo
          </CardTitle>
          <CardDescription>
            Tu avance en cada módulo de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay módulos disponibles aún
            </div>
          ) : (
            modules.map((module) => {
              const progress = module.progress;
              const progressPercentage = progress
                ? progress.status === "COMPLETED"
                  ? 100
                  : progress.status === "IN_PROGRESS"
                  ? 50
                  : 0
                : 0;

              return (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{module.title}</span>
                      {progress?.status === "COMPLETED" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {progressPercentage}%
                      </span>
                      {progress?.score && (
                        <Badge variant="outline">{progress.score}%</Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Logros
          </CardTitle>
          <CardDescription>
            {unlockedAchievements.length} de {achievements.length} logros
            desbloqueados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay logros disponibles aún
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const isUnlocked = !!achievement.unlockedAt;
                return (
                  <Card
                    key={achievement.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isUnlocked
                        ? "hover:shadow-md border-green-200 bg-green-50"
                        : "opacity-60 hover:opacity-80"
                    }`}
                    onClick={() =>
                      isUnlocked && onAchievementClick?.(achievement)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            isUnlocked ? "bg-yellow-100" : "bg-gray-100"
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant={isUnlocked ? "default" : "secondary"}
                            >
                              {isUnlocked ? "Desbloqueado" : "Bloqueado"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              +{achievement.xpReward} XP
                            </span>
                          </div>
                          {isUnlocked && achievement.unlockedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(
                                achievement.unlockedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos 7 días de aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProgress
                .sort(
                  (a, b) =>
                    new Date(b.completedAt || "").getTime() -
                    new Date(a.completedAt || "").getTime()
                )
                .slice(0, 5)
                .map((progress) => (
                  <div
                    key={progress.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">
                          {progress.lessonId ? "Lección" : "Módulo"} Completado
                        </div>
                        <div className="text-sm text-gray-600">
                          {progress.completedAt &&
                            new Date(progress.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {progress.score && (
                        <Badge variant="outline">{progress.score}%</Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
