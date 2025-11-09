"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Award,
  Play,
} from "lucide-react";
import {
  useClientLearningStore,
  useTotalXP,
  useStreak,
  type LearningModule,
  type ModuleType,
} from "@/store/client-store";

const moduleIcons = {
  VOCABULARY: BookOpen,
  GRAMMAR: Target,
  READING: BookOpen,
  LISTENING: Clock,
  SPEAKING: Trophy,
  WRITING: Award,
};

const moduleColors = {
  VOCABULARY: "bg-blue-500",
  GRAMMAR: "bg-green-500",
  READING: "bg-purple-500",
  LISTENING: "bg-orange-500",
  SPEAKING: "bg-red-500",
  WRITING: "bg-indigo-500",
};

interface ModuleCardProps {
  module: LearningModule;
  onStart: (module: LearningModule) => void;
}

function ModuleCard({ module, onStart }: ModuleCardProps) {
  const Icon = moduleIcons[module.type];
  const progress = module.progress;
  const progressPercentage = progress
    ? progress.status === "COMPLETED"
      ? 100
      : progress.status === "IN_PROGRESS"
      ? 50
      : 0
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg ${
                moduleColors[module.type]
              } bg-opacity-10 flex items-center justify-center`}
            >
              <Icon
                className={`w-6 h-6 ${moduleColors[module.type].replace(
                  "bg-",
                  "text-"
                )}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>
            </div>
          </div>
          {module.isPremium && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress indicator */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progress.status === "COMPLETED" && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                Completado
              </Badge>
            )}
          </div>
        )}

        {/* Module stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{module.lessons?.length || 0} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Nivel {module.level}</span>
          </div>
        </div>

        {/* Action button */}
        <Button
          className="w-full"
          onClick={() => onStart(module)}
          variant={progress?.status === "COMPLETED" ? "outline" : "default"}
        >
          {progress?.status === "COMPLETED"
            ? "Repasar"
            : progress?.status === "IN_PROGRESS"
            ? "Continuar"
            : "Comenzar"}
          <Play className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface LearningDashboardProps {
  onModuleSelect: (module: LearningModule) => void;
}

export function LearningDashboard({ onModuleSelect }: LearningDashboardProps) {
  const { user, modules, achievements } = useClientLearningStore();
  const totalXP = useTotalXP();
  const streak = useStreak();

  const completedModules = modules.filter(
    (m) => m.progress?.status === "COMPLETED"
  ).length;

  const inProgressModules = modules.filter(
    (m) => m.progress?.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-tech-gradient rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Hola, {user?.name || "Developer"}! 👋
            </h1>
            <p className="text-tech-primary bg-tech-primary bg-opacity-20">
              Listo para mejorar tu inglés técnico hoy?
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalXP}</div>
                <div className="text-sm text-tech-primary">XP Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">🔥 {streak}</div>
                <div className="text-sm text-tech-primary">Racha</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedModules}</div>
            <div className="text-sm text-gray-600">Módulos Completados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{inProgressModules}</div>
            <div className="text-sm text-gray-600">En Progreso</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-gray-600">Logros</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user?.level}</div>
            <div className="text-sm text-gray-600">Nivel Actual</div>
          </CardContent>
        </Card>
      </div>

      {/* Modules section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Módulos de Aprendizaje
          </h2>
          <Badge variant="outline">{modules.length} disponibles</Badge>
        </div>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay módulos disponibles
              </h3>
              <p className="text-gray-600">
                Los módulos aparecerán aquí una vez que estén configurados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onStart={onModuleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent achievements */}
      {achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Logros Recientes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.slice(0, 3).map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-${achievement.badgeColor}-100 flex items-center justify-center`}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
