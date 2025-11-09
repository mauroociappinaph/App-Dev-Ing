'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Trophy,
  BookOpen,
  RotateCcw
} from 'lucide-react'
import { ExerciseComponent } from './exercise'
import { useLearningStore, type Lesson, type Exercise, type ExerciseResponse } from '@/store/learning-store'

interface LessonPlayerProps {
  lesson: Lesson
  onComplete: (lessonId: string, score: number, timeSpent: number) => void
  onExit: () => void
}

export function LessonPlayer({ lesson, onComplete, onExit }: LessonPlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [responses, setResponses] = useState<ExerciseResponse[]>([])
  const [lessonStartTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)

  const { 
    exercises = [], 
    startLearningSession, 
    endLearningSession, 
    addExerciseResponse,
    updateProgress 
  } = useLearningStore()

  const currentExercise = exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100
  const correctAnswers = responses.filter(r => r.isCorrect).length
  const score = exercises.length > 0 ? Math.round((correctAnswers / exercises.length) * 100) : 0

  useEffect(() => {
    // Start learning session when lesson begins
    startLearningSession()
  }, [startLearningSession])

  const handleExerciseResponse = (response: ExerciseResponse) => {
    setResponses(prev => [...prev, response])
    addExerciseResponse(response)
  }

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      // Lesson completed
      finishLesson()
    }
  }

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
    }
  }

  const finishLesson = () => {
    const totalTimeSpent = Math.floor((Date.now() - lessonStartTime) / 1000)
    const session = endLearningSession()
    
    // Update lesson progress
    updateProgress({
      id: `progress-${lesson.id}`,
      userId: 'user-1', // This should come from store
      lessonId: lesson.id,
      status: 'COMPLETED',
      score,
      timeSpent: totalTimeSpent,
      attempts: 1,
      bestScore: score,
      completedAt: new Date().toISOString(),
    })

    setShowResults(true)
    onComplete(lesson.id, score, totalTimeSpent)
  }

  const restartLesson = () => {
    setCurrentExerciseIndex(0)
    setResponses([])
    setShowResults(false)
    startLearningSession()
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Lección Completada!</CardTitle>
            <CardDescription>
              {lesson.title}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score display */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">{score}%</div>
              <div className="text-gray-600">
                {correctAnswers} de {exercises.length} respuestas correctas
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rendimiento</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>

            {/* Time spent */}
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Tiempo total: {Math.floor((Date.now() - lessonStartTime) / 1000 / 60)} minutos
              </span>
            </div>

            {/* Achievement badges */}
            <div className="flex justify-center gap-2">
              {score >= 90 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  ⭐ Excelente
                </Badge>
              )}
              {score >= 70 && score < 90 && (
                <Badge className="bg-blue-100 text-blue-800">
                  👍 Buen trabajo
                </Badge>
              )}
              {score >= 50 && score < 70 && (
                <Badge className="bg-green-100 text-green-800">
                  ✅ Completado
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={restartLesson}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Repetir lección
              </Button>
              <Button onClick={onExit}>
                <BookOpen className="w-4 h-4 mr-2" />
                Continuar aprendiendo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay ejercicios disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Esta lección no contiene ejercicios aún.
            </p>
            <Button onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a módulos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir de la lección
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Ejercicio {currentExerciseIndex + 1} de {exercises.length}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4" />
              {correctAnswers} correctas
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{lesson.title}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Exercise */}
      <div className="max-w-4xl mx-auto">
        <ExerciseComponent
          exercise={currentExercise}
          onResponse={handleExerciseResponse}
          onNext={handleNext}
          onPrevious={handlePrevious}
          showPrevious={currentExerciseIndex > 0}
          showNext={true}
          isLast={currentExerciseIndex === exercises.length - 1}
        />
      </div>
    </div>
  )
}