'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Volume2
} from 'lucide-react'
import { useLearningStore, type Exercise, type ExerciseResponse } from '@/store/learning-store'

interface ExerciseProps {
  exercise: Exercise
  onResponse: (response: ExerciseResponse) => void
  onNext?: () => void
  onPrevious?: () => void
  showPrevious?: boolean
  showNext?: boolean
  isLast?: boolean
}

export function ExerciseComponent({ 
  exercise, 
  onResponse, 
  onNext, 
  onPrevious, 
  showPrevious = false, 
  showNext = true,
  isLast = false 
}: ExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  const { user, currentSession } = useLearningStore()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const handleSubmit = () => {
    if (!user || !currentSession) return

    const answer = exercise.type === 'MULTIPLE_CHOICE' ? selectedAnswer : userAnswer
    if (!answer) return

    const correct = answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowFeedback(true)

    const response: ExerciseResponse = {
      id: `response-${Date.now()}`,
      userId: user.id,
      exerciseId: exercise.id,
      userAnswer: answer,
      isCorrect: correct,
      feedback: correct ? exercise.explanation : `Incorrecto. ${exercise.explanation || ''}`,
      timeSpent,
      hintsUsed,
      sessionId: currentSession.id,
      createdAt: new Date().toISOString(),
    }

    onResponse(response)
  }

  const handleHint = () => {
    if (exercise.hints && hintsUsed < exercise.hints.length) {
      setHintsUsed(hintsUsed + 1)
    }
  }

  const handleReset = () => {
    setSelectedAnswer('')
    setUserAnswer('')
    setShowFeedback(false)
    setIsCorrect(null)
    setHintsUsed(0)
  }

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            {exercise.options && (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {exercise.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        )

      case 'FILL_BLANK':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="min-h-[100px]"
            />
          </div>
        )

      case 'TRANSLATION':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Traduce la frase al inglés..."
              className="min-h-[100px]"
            />
          </div>
        )

      case 'LISTENING_COMPREHENSION':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Button variant="outline" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Reproducir audio
            </Button>
            {exercise.options && (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {exercise.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        )

      case 'SPEAKING_PRACTICE':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Practica tu respuesta hablada escribiéndola primero..."
              className="min-h-[120px]"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Grabar respuesta
            </Button>
          </div>
        )

      case 'CODE_REVIEW':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
              {`// Example code snippet
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`}
            </div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe tu feedback en inglés..."
              className="min-h-[120px]"
            />
          </div>
        )

      case 'EMAIL_WRITING':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe el email profesional en inglés..."
              className="min-h-[150px]"
            />
          </div>
        )

      case 'MEETING_SIMULATION':
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Escenario: You are in a daily stand-up meeting. Your turn to speak.
              </p>
            </div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="¿Qué dirías en esta situación?..."
              className="min-h-[120px]"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium">{exercise.question}</div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="min-h-[100px]"
            />
          </div>
        )
    }
  }

  const currentAnswer = exercise.type === 'MULTIPLE_CHOICE' ? selectedAnswer : userAnswer
  const canSubmit = currentAnswer && currentAnswer.trim() !== ''
  const hasHints = exercise.hints && exercise.hints.length > 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ejercicio {exercise.order}
              <Badge variant="outline">
                Dificultad: {exercise.difficulty}/5
              </Badge>
            </CardTitle>
            <CardDescription>
              {exercise.type.replace('_', ' ').toLowerCase()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderExerciseContent()}

        {/* Hints section */}
        {hasHints && !showFeedback && (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={hintsUsed >= (exercise.hints?.length || 0)}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Pista ({hintsUsed}/{exercise.hints?.length})
            </Button>
            {hintsUsed > 0 && exercise.hints && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  {exercise.hints[hintsUsed - 1]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feedback section */}
        {showFeedback && (
          <div className={`p-4 rounded-lg border ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                </h4>
                <p className={`text-sm mt-1 ${
                  isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isCorrect ? exercise.explanation : `La respuesta correcta es: ${exercise.correctAnswer}. ${exercise.explanation || ''}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {showPrevious && (
              <Button variant="outline" onClick={onPrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
          
          <div className="flex gap-2">
            {!showFeedback ? (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                Enviar respuesta
              </Button>
            ) : (
              <Button onClick={onNext}>
                {isLast ? 'Finalizar' : 'Siguiente'}
                {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}