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
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Award,
  Play,
  Loader2,
  Star,
  Flame,
  CheckCircle,
  Circle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useModules,
  useUserProgress,
  type Module,
  type UserProgressResponse,
} from "@/hooks/use-api";
import {
  type LearningModule,
  type ModuleType,
  type Level,
  type ExerciseType,
} from "@/store/client-store";
import { useSession } from "next-auth/react";

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
  module: Module;
  onStart: (module: Module) => void;
  userProgress?: UserProgressResponse | null;
}

function ModuleCard({ module, onStart, userProgress }: ModuleCardProps) {
  const Icon = moduleIcons[module.type as keyof typeof moduleIcons] || BookOpen;

  // Find progress for this module
  const progress = userProgress?.progress.find((p) => p.moduleId === module.id);
  const progressPercentage = progress
    ? progress.status === "COMPLETED"
      ? 100
      : progress.status === "IN_PROGRESS"
      ? 50
      : 0
    : 0;

  const getModuleColor = (type: string) => {
    switch (type) {
      case "VOCABULARY":
        return {
          bg: "bg-blue-500",
          text: "text-blue-500",
          glow: "shadow-blue-500/25",
        };
      case "GRAMMAR":
        return {
          bg: "bg-green-500",
          text: "text-green-500",
          glow: "shadow-green-500/25",
        };
      case "READING":
        return {
          bg: "bg-purple-500",
          text: "text-purple-500",
          glow: "shadow-purple-500/25",
        };
      case "LISTENING":
        return {
          bg: "bg-orange-500",
          text: "text-orange-500",
          glow: "shadow-orange-500/25",
        };
      case "SPEAKING":
        return {
          bg: "bg-red-500",
          text: "text-red-500",
          glow: "shadow-red-500/25",
        };
      case "WRITING":
        return {
          bg: "bg-indigo-500",
          text: "text-indigo-500",
          glow: "shadow-indigo-500/25",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-gray-500",
          glow: "shadow-gray-500/25",
        };
    }
  };

  const colors = getModuleColor(module.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          initial={false}
        />

        {/* Progress completion overlay */}
        {progress?.status === "COMPLETED" && (
          <motion.div
            className="absolute top-2 right-2 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        )}

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center relative ${colors.bg}`}
                whileHover={{
                  scale: 1.1,
                  boxShadow: `0 0 20px ${colors.glow}`,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{
                    rotate: progress?.status === "COMPLETED" ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: progress?.status === "COMPLETED" ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </motion.div>

                {/* Sparkle effect for completed modules */}
                {progress?.status === "COMPLETED" && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </motion.div>
                )}
              </motion.div>

              <div>
                <CardTitle className="text-lg group-hover:text-gray-800 transition-colors">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </div>
            </motion.div>

            {module.isPremium && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress indicator */}
          {progress && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progreso</span>
                <motion.span
                  className="font-medium"
                  key={progressPercentage}
                  initial={{ scale: 1.2, color: "#10b981" }}
                  animate={{ scale: 1, color: "#374151" }}
                  transition={{ duration: 0.3 }}
                >
                  {progressPercentage}%
                </motion.span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Progress value={progressPercentage} className="h-2" />
              </motion.div>
              {progress.status === "COMPLETED" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Module stats */}
          <motion.div
            className="flex items-center justify-between text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-4 h-4" />
              <span>{module.lessons?.length || 0} lecciones</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-4 h-4" />
              <span>Nivel {module.level.code}</span>
            </motion.div>
          </motion.div>

          {/* Action button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full group-hover:shadow-lg transition-all duration-200"
              onClick={() => onStart(module)}
              variant={progress?.status === "COMPLETED" ? "outline" : "default"}
            >
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {progress?.status === "COMPLETED"
                  ? "Repasar"
                  : progress?.status === "IN_PROGRESS"
                  ? "Continuar"
                  : "Comenzar"}
              </motion.span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Play className="w-4 h-4 ml-2" />
              </motion.div>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LearningDashboardProps {
  onModuleSelect: (module: Module) => void;
}

export function LearningDashboard({ onModuleSelect }: LearningDashboardProps) {
  const { data: session } = useSession();
  const {
    data: modules,
    loading: modulesLoading,
    error: modulesError,
  } = useModules({
    includeLessons: true,
  });
  const { data: userProgress, loading: progressLoading } = useUserProgress();

  // Convert Module[] to LearningModule[] for compatibility
  const convertToLearningModules = (apiModules: Module[]): LearningModule[] => {
    return apiModules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description || "",
      type: module.type as ModuleType,
      level: module.level.code as Level,
      isPremium: module.isPremium,
      order: module.order,
      icon: "📚", // Default icon
      lessons:
        module.lessons?.map((lesson) => ({
          id: lesson.id,
          moduleId: lesson.moduleId,
          title: lesson.title,
          description: lesson.description || "",
          content: lesson.content || "",
          type: lesson.type as ExerciseType,
          level: lesson.level as Level,
          duration: lesson.duration,
          difficulty: lesson.difficulty,
          order: lesson.order,
          isPublished: lesson.isPublished,
        })) || [],
      progress: undefined, // Will be set from userProgress
    }));
  };

  const isLoading = modulesLoading || progressLoading;
  const error = modulesError;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              ⚠️ Error al cargar los datos
            </div>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedModules =
    userProgress?.progress.filter((p) => p.status === "COMPLETED" && p.moduleId)
      .length || 0;

  const inProgressModules =
    userProgress?.progress.filter(
      (p) => p.status === "IN_PROGRESS" && p.moduleId
    ).length || 0;

  if (isLoading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Welcome section skeleton */}
        <div className="bg-tech-gradient rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 bg-white/20" />
              <Skeleton className="h-4 w-48 bg-white/20" />
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Skeleton className="h-8 w-16 bg-white/20 mb-1" />
                <Skeleton className="h-3 w-12 bg-white/20" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-12 bg-white/20 mb-1" />
                <Skeleton className="h-3 w-10 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="w-8 h-8 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modules section skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome section */}
      <motion.div
        className="bg-tech-gradient rounded-xl p-6 text-white relative overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="flex items-center justify-between relative z-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.h1
              className="text-2xl font-bold mb-2 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              ¡Hola, {session?.user?.name || "Developer"}!
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-tech-primary bg-tech-primary bg-opacity-20 px-3 py-1 rounded-full inline-block text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Listo para mejorar tu inglés técnico hoy?
            </motion.p>
          </motion.div>

          <motion.div
            className="text-right flex items-center gap-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-2xl font-bold flex items-center gap-1"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 10px rgba(255,255,255,0.3)",
                    "0 0 0px rgba(255,255,255,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-6 h-6 text-yellow-300" />
                {userProgress?.stats.totalXP || 0}
              </motion.div>
              <div className="text-sm text-tech-primary">XP Total</div>
            </motion.div>

            <motion.div
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-2xl font-bold flex items-center gap-1"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,69,0,0)",
                    "0 0 10px rgba(255,69,0,0.5)",
                    "0 0 0px rgba(255,69,0,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Flame className="w-6 h-6 text-orange-400" />
                {userProgress?.stats.currentStreak || 0}
              </motion.div>
              <div className="text-sm text-tech-primary">Racha</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-3 md:p-4 text-center">
              <motion.div
                className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2"
                whileHover={{
                  rotate: [0, -10, 10, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Trophy className="w-full h-full text-yellow-500" />
              </motion.div>
              <motion.div
                className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {completedModules}
              </motion.div>
              <div className="text-xs md:text-sm text-gray-600">
                Completados
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-3 md:p-4 text-center">
              <motion.div
                className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2"
                whileHover={{
                  rotate: [0, 10, -10, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              >
                <TrendingUp className="w-full h-full text-blue-500" />
              </motion.div>
              <motion.div
                className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {inProgressModules}
              </motion.div>
              <div className="text-xs md:text-sm text-gray-600">
                En Progreso
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-3 md:p-4 text-center">
              <motion.div
                className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2"
                whileHover={{
                  rotate: [0, -15, 15, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Award className="w-full h-full text-purple-500" />
              </motion.div>
              <motion.div
                className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                0
              </motion.div>
              <div className="text-xs md:text-sm text-gray-600">Logros</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-3 md:p-4 text-center">
              <motion.div
                className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2"
                whileHover={{
                  rotate: [0, 15, -15, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Target className="w-full h-full text-green-500" />
              </motion.div>
              <motion.div
                className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                {userProgress?.user.level || "BEGINNER"}
              </motion.div>
              <div className="text-xs md:text-sm text-gray-600">Nivel</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modules section */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h2
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            Módulos de Aprendizaje
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
            >
              📚
            </motion.span>
          </motion.h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {modules?.length || 0} disponibles
            </Badge>
          </motion.div>
        </motion.div>

        {!modules || modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative mx-auto mb-6 w-24 h-24"
                >
                  {/* Animated background circles */}
                  <motion.div
                    className="absolute inset-0 bg-blue-100 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-2 bg-purple-100 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <motion.div
                    className="absolute inset-4 bg-green-100 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />

                  {/* Main icon */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center w-full h-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <BookOpen className="w-12 h-12 text-gray-500" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  ¡Pronto tendremos módulos increíbles!
                </motion.h3>

                <motion.p
                  className="text-gray-600 mb-6 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Estamos trabajando duro para crear contenido de aprendizaje
                  excepcional. Los módulos aparecerán aquí muy pronto con
                  ejercicios interactivos, lecciones prácticas y mucho más.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-center gap-2 mb-4">
                    {["📚", "🎯", "⚡", "🏆"].map((emoji, index) => (
                      <motion.span
                        key={index}
                        className="text-2xl"
                        animate={{
                          y: [0, -5, 0],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-gray-50 border-gray-300"
                      onClick={() => window.location.reload()}
                    >
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        🔄
                      </motion.span>
                      <span className="ml-2">Actualizar página</span>
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onStart={onModuleSelect}
                userProgress={userProgress}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Coming soon: Achievements section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Próximamente</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistema de Logros
            </h3>
            <p className="text-gray-600">
              ¡Muy pronto podrás desbloquear logros y badges por tu progreso!
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
