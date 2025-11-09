'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, BookOpen, Trophy, Zap } from 'lucide-react'
import { useLearningStore, type Level } from '@/store/learning-store'

const levelDescriptions = {
  BEGINNER: {
    title: 'Principiante',
    description: 'Ideal si estás empezando a aprender inglés técnico. Enfocado en vocabulario básico y frases esenciales para el desarrollo.',
    features: [
      'Vocabulario técnico fundamental',
      'Gramática básica aplicada a la programación',
      'Frases comunes en reuniones de equipo',
      'Lectura de documentación sencilla',
      'Ejercicios de comprensión auditiva básica'
    ],
    color: 'bg-green-500',
    borderColor: 'border-green-200'
  },
  INTERMEDIATE: {
    title: 'Intermedio',
    description: 'Para quienes ya tienen bases y quieren mejorar su comunicación profesional en entornos de desarrollo.',
    features: [
      'Vocabulario técnico avanzado',
      'Expresiones idiomáticas en IT',
      'Comunicación en code reviews',
      'Escritura de emails técnicos',
      'Simulaciones de reuniones y entrevistas'
    ],
    color: 'bg-blue-500',
    borderColor: 'border-blue-200'
  },
  ADVANCED: {
    title: 'Avanzado',
    description: 'Perfecciona tu inglés para liderazgo técnico, presentaciones y comunicación a nivel ejecutivo.',
    features: [
      'Liderazgo y gestión técnica',
      'Negociación y presentación de proyectos',
      'Inglés para arquitectura de software',
      'Comunicación con stakeholders',
      'Mentoría y documentación avanzada'
    ],
    color: 'bg-purple-500',
    borderColor: 'border-purple-200'
  }
}

interface LevelSelectionProps {
  onLevelSelect: (level: Level) => void
  selectedLevel?: Level
}

export function LevelSelection({ onLevelSelect, selectedLevel }: LevelSelectionProps) {
  const [hoveredLevel, setHoveredLevel] = useState<Level | null>(null)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Selecciona tu nivel de inglés</h2>
        <p className="text-tech-muted">
          Elige el nivel que mejor describe tu conocimiento actual del inglés técnico
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(levelDescriptions) as Level[]).map((level) => {
          const config = levelDescriptions[level]
          const isSelected = selectedLevel === level
          const isHovered = hoveredLevel === level

          return (
            <Card
              key={level}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? `ring-2 ring-offset-2 ${config.borderColor.replace('border-', 'ring-')}`
                  : 'hover:shadow-lg'
              } ${isHovered ? 'transform -translate-y-1' : ''}`}
              onClick={() => onLevelSelect(level)}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full ${config.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                  <div className={`w-8 h-8 rounded-full ${config.color}`} />
                </div>
                <CardTitle className="text-xl">{config.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {config.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="w-full justify-center">
                      Nivel seleccionado
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedLevel && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => {
              // Continue to next step
              console.log('Level selected:', selectedLevel)
            }}
            className="px-8"
          >
            Continuar con {levelDescriptions[selectedLevel].title}
          </Button>
        </div>
      )}
    </div>
  )
}

interface OnboardingFlowProps {
  onComplete: (userData: { name: string; email: string; level: Level }) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    level: 'BEGINNER' as Level
  })

  const totalSteps = 3

  const updateUserData = (field: keyof typeof userData, value: string | Level) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete(userData)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido a TechEnglish Pro
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Aprende inglés técnico con contenido diseñado específicamente para programadores. 
                Mejora tu comunicación profesional en entornos de desarrollo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Aprendizaje Práctico</h3>
                <p className="text-sm text-gray-600">
                  Ejercicios reales basados en situaciones diarias de desarrollo
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Progreso Gamificado</h3>
                <p className="text-sm text-gray-600">
                  Gana XP, desbloquea logros y mantén tu racha de aprendizaje
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Contenido IA</h3>
                <p className="text-sm text-gray-600">
                  Lecciones personalizadas generadas por inteligencia artificial
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <LevelSelection
              selectedLevel={userData.level}
              onLevelSelect={(level) => updateUserData('level', level)}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Configura tu perfil</h2>
              <p className="text-gray-600">
                Cuéntanos un poco sobre ti para personalizar tu experiencia
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={userData.name}
                  onChange={(e) => updateUserData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => updateUserData('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nivel seleccionado:</strong> {levelDescriptions[userData.level].title}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-tech-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex items-center ${
                  i < totalSteps - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step
                      ? 'bg-tech-primary text-white'
                      : 'bg-tech-muted text-tech-subtle'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      i + 1 < step ? 'bg-tech-primary' : 'bg-tech-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card className="p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Anterior
            </Button>
            <Button
              onClick={nextStep}
              disabled={
                (step === 2 && !userData.level) ||
                (step === 3 && (!userData.name || !userData.email))
              }
            >
              {step === totalSteps ? 'Comenzar a aprender' : 'Siguiente'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}