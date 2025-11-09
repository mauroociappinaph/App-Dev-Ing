# TechEnglish Pro - English Learning Platform for Developers

Una aplicación web moderna diseñada específicamente para que programadores aprendan inglés técnico y profesional, combinando contenido práctico del mundo IT con inteligencia artificial para una experiencia de aprendizaje personalizada.

## 🎯 Visión General

TechEnglish Pro es una plataforma educativa que enseña inglés técnico aplicado al mundo del desarrollo de software. La aplicación utiliza ejemplos reales de reuniones, code reviews, debugging, documentación y entrevistas para proporcionar un aprendizaje contextual y relevante.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

- **Frontend**: Next.js 15 con App Router y TypeScript 5
- **Estilos**: Tailwind CSS 4 con shadcn/ui components
- **Estado Global**: Zustand con persistencia
- **Base de Datos**: Prisma ORM con SQLite
- **Backend**: API Routes de Next.js
- **Inteligencia Artificial**: z-ai-web-dev-sdk para generación de contenido
- **Autenticación**: NextAuth.js (configurado pero no implementado en demo)
- **Real-time**: Socket.io (disponible para futuras funcionalidades)

### Estructura del Proyecto

```
src/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── ai/                   # Endpoints de IA
│   │   │   ├── generate/         # Generación de contenido
│   │   │   └── feedback/         # Feedback de ejercicios
│   │   └── health/              # Health check
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página principal
├── components/                   # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   ├── learning/                 # Componentes de aprendizaje
│   │   ├── dashboard.tsx        # Dashboard principal
│   │   └── onboarding.tsx       # Flujo de bienvenida
│   ├── exercises/               # Componentes de ejercicios
│   │   ├── exercise.tsx         # Ejercicio individual
│   │   └── lesson-player.tsx    # Reproductor de lecciones
│   └── progress/                # Componentes de progreso
│       └── dashboard.tsx        # Dashboard de progreso
├── store/                       # Estado global con Zustand
│   └── learning-store.ts        # Store principal de aprendizaje
├── lib/                         # Utilidades y configuración
│   ├── db.ts                    # Cliente Prisma
│   ├── socket.ts                # Configuración Socket.io
│   └── utils.ts                 # Utilidades varias
└── hooks/                       # Hooks personalizados
    ├── use-mobile.ts
    └── use-toast.ts
```

## 🗄️ Modelo de Datos

### Entidades Principales

#### User
```typescript
interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  level: Level // BEGINNER | INTERMEDIATE | ADVANCED
  nativeLang: string
  totalXP: number
  streak: number
  lastActive: string
}
```

#### LearningModule
```typescript
interface LearningModule {
  id: string
  title: string
  description: string
  type: ModuleType // VOCABULARY | GRAMMAR | READING | LISTENING | SPEAKING | WRITING
  level: Level
  isPremium: boolean
  order: number
  icon?: string
  lessons?: Lesson[]
}
```

#### Lesson
```typescript
interface Lesson {
  id: string
  moduleId: string
  title: string
  description?: string
  content: string // JSON con contenido estructurado
  type: ExerciseType
  level: Level
  duration: number // minutos estimados
  exercises?: Exercise[]
}
```

#### Exercise
```typescript
interface Exercise {
  id: string
  lessonId: string
  question: string
  options?: string[] // para multiple choice
  correctAnswer: string
  explanation?: string
  hints?: string[]
  difficulty: number // 1-5
}
```

#### UserProgress
```typescript
interface UserProgress {
  id: string
  userId: string
  moduleId?: string
  lessonId?: string
  status: ProgressStatus // NOT_STARTED | IN_PROGRESS | COMPLETED | MASTERED
  score?: number
  timeSpent: number
  attempts: number
  bestScore?: number
  completedAt?: string
}
```

## 🧠 Flujo de Usuario

### 1. Onboarding
- **Paso 1**: Bienvenida y presentación de la plataforma
- **Paso 2**: Selección de nivel (Beginner/Intermediate/Advanced)
- **Paso 3**: Configuración de perfil (nombre, email)

### 2. Dashboard Principal
- Vista general de progreso y estadísticas
- Módulos de aprendizaje disponibles
- Logros desbloqueados
- Racha de aprendizaje

### 3. Módulos de Aprendizaje
- **Vocabulary**: Términos técnicos esenciales
- **Grammar**: Conceptos gramaticales aplicados a la programación
- **Reading**: Comprensión de documentación técnica
- **Listening**: Diálogos y reuniones técnicas
- **Speaking**: Práctica de comunicación profesional
- **Writing**: Emails técnicos y documentación

### 4. Sistema de Ejercicios
- Multiple Choice
- Fill in the Blanks
- Translation
- Listening Comprehension
- Speaking Practice
- Code Review Scenarios
- Email Writing
- Meeting Simulations

## 🤖 Integración con IA

### Generación de Contenido
La aplicación utiliza `z-ai-web-dev-sdk` para generar contenido dinámico:

```typescript
// Ejemplo de generación de vocabulario
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Generate 10 technical vocabulary words about databases',
    type: 'vocabulary',
    level: 'INTERMEDIATE',
    context: 'Software development'
  })
})
```

### Feedback Inteligente
Cada respuesta del usuario es analizada por la IA para proporcionar feedback constructivo:

```typescript
const feedback = await fetch('/api/ai/feedback', {
  method: 'POST',
  body: JSON.stringify({
    userAnswer: 'The function throw an error',
    correctAnswer: 'The function throws an error',
    exerciseType: 'GRAMMAR',
    context: 'Error handling in programming'
  })
})
```

## 🎮 Gamificación

### Sistema de XP
- **Respuesta correcta**: 10 XP base
- **Bonus velocidad**: Hasta 60 XP extra
- **Bonus sin pistas**: 2 XP por pista no usada
- **Logros**: XP adicional variable

### Logros (Achievements)
- **Primeros Pasos**: Completar primera lección
- **En Racha**: Mantener racha de 7 días
- **Vocabulary Master**: Completar módulo de vocabulario
- **Grammar Expert**: Obtener 90%+ en ejercicios de gramática

### Niveles de Progreso
- **Beginner**: Conceptos básicos y vocabulario esencial
- **Intermediate**: Comunicación profesional y técnica
- **Advanced**: Liderazgo y comunicación ejecutiva

## 📊 Estado Global con Zustand

### Store Structure
```typescript
interface LearningStore {
  // Estado del usuario
  user: User | null
  isAuthenticated: boolean
  
  // Estado de aprendizaje
  currentLevel: Level
  selectedModule: LearningModule | null
  currentLesson: Lesson | null
  currentSession: LearningSession | null
  
  // Progreso
  userProgress: UserProgress[]
  modules: LearningModule[]
  achievements: Achievement[]
  
  // Acciones
  startLearningSession: () => string
  endLearningSession: () => void
  updateProgress: (progress: UserProgress) => void
  addExerciseResponse: (response: ExerciseResponse) => void
  unlockAchievement: (achievement: Achievement) => void
}
```

### Selectores Optimizados
```typescript
// Selectores básicos
export const useUser = () => useLearningStore((state) => state.user)
export const useModules = () => useLearningStore((state) => state.modules)

// Selectores computados
export const useModulesByLevel = (level: Level) => 
  useLearningStore((state) => state.modules.filter(module => module.level === level))
```

## 🚀 Despliegue y Escalabilidad

### Arquitectura Escalable
- **Frontend**: Desplegar en Vercel (optimizado para Next.js)
- **Backend**: API routes incluidas en el mismo deploy
- **Base de Datos**: SQLite para desarrollo, migrar a PostgreSQL en producción
- **CDN**: Para assets y contenido estático

### Monetización Futura
- **Premium Modules**: Contenido avanzado y especializado
- **1-on-1 Sessions**: Tutoría personalizada con instructores
- **Corporate Plans**: Licencias para empresas
- **Certifications**: Exámenes oficiales y certificados

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd techenglish-pro

# Instalar dependencias
npm install

# Configurar base de datos
npm run db:push

# Iniciar desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Verificación de código
npm run db:push  # Actualizar schema en base de datos
```

## 📈 Roadmap Futuro

### Características Próximas
1. **Autenticación Completa**: NextAuth.js con proveedores múltiples
2. **Audio Real**: Grabación y reproducción de voz para speaking practice
3. **Video Lessons**: Contenido multimedia para mejor engagement
4. **Community**: Foros y discusiones entre estudiantes
5. **Analytics Avanzado**: Insights detallados de progreso
6. **Mobile App**: Versión nativa para iOS y Android

### Mejoras Técnicas
1. **Testing Suite**: Unit tests, integration tests, E2E tests
2. **CI/CD Pipeline**: GitHub Actions para deploy automático
3. **Monitoring**: Error tracking y performance monitoring
4. **Caching**: Redis para mejor rendimiento
5. **Microservices**: Arquitectura de microservicios para escalabilidad

## 🤝 Contribución

Este proyecto está diseñado como una demostración de arquitectura moderna y mejores prácticas en desarrollo web. Para contribuir:

1. Fork del repositorio
2. Crear feature branch: `git checkout -b feature/amazing-feature`
3. Commit cambios: `git commit -m 'Add amazing feature'`
4. Push al branch: `git push origin feature/amazing-feature`
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es una demostración educativa. Para uso comercial, contactar al equipo de desarrollo.

---

**TechEnglish Pro** - Transformando cómo los programadores aprenden inglés técnico 🚀