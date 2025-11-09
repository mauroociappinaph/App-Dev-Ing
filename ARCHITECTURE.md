# Arquitectura Técnica - TechEnglish Pro

## 📋 Visión Arquitectónica

TechEnglish Pro implementa una arquitectura moderna y escalable siguiendo los principios de **SOLID**, **Clean Architecture** y **Domain-Driven Design**. La aplicación está diseñada para ser mantenible, extensible y optimizada para el aprendizaje.

## 🏗️ Patrones Arquitectónicos

### 1. Clean Architecture Layers

```
┌─────────────────────────────────────┐
│           Presentation Layer          │
│  (React Components, UI, Hooks)      │
├─────────────────────────────────────┤
│            Business Layer            │
│     (Zustand Store, Logic)         │
├─────────────────────────────────────┤
│            Data Layer               │
│   (API Routes, Prisma, Cache)      │
├─────────────────────────────────────┤
│          Infrastructure Layer        │
│  (Database, External APIs, Utils)  │
└─────────────────────────────────────┘
```

### 2. Separation of Concerns

- **Components**: Solo presentación y UI state
- **Store**: Lógica de negocio y estado global
- **API**: Validación, negocio y persistencia
- **Utils**: Funciones puras y reutilizables

## 🔄 Flujo de Datos

### Request-Response Flow

```
User Interaction → Component → Store Action → API Call → Database
       ↑                                                           ↓
UI Update ← Store State ← API Response ← Business Logic ← Data Layer
```

### State Management Pattern

```typescript
// 1. Component dispatches action
const handleAnswer = (answer: string) => {
  addExerciseResponse(response)
}

// 2. Store processes business logic
addExerciseResponse: (response) => {
  const { currentSession } = get()
  const updatedSession = {
    ...currentSession,
    responses: [...currentSession.responses, response],
    exercisesCompleted: currentSession.exercisesCompleted + 1,
  }
  set({ currentSession: updatedSession })
}

// 3. Optional: Persist to backend
useEffect(() => {
  if (currentSession) {
    saveSessionToBackend(currentSession)
  }
}, [currentSession])
```

## 🗂️ Estructura de Carpetas Detallada

### `/src/app` - Next.js App Router
```
app/
├── api/                          # API Routes (Backend)
│   ├── ai/                      # AI Integration
│   │   ├── generate/route.ts    # Content generation
│   │   └── feedback/route.ts    # Feedback generation
│   └── health/route.ts          # Health check endpoint
├── globals.css                  # Global styles
├── layout.tsx                   # Root layout
└── page.tsx                     # Home page
```

### `/src/components` - React Components
```
components/
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── ... (20+ components)
├── learning/                    # Learning-specific components
│   ├── dashboard.tsx           # Main learning dashboard
│   └── onboarding.tsx          # User onboarding flow
├── exercises/                   # Exercise components
│   ├── exercise.tsx            # Individual exercise
│   └── lesson-player.tsx       # Lesson flow manager
└── progress/                    # Progress tracking
    └── dashboard.tsx           # Progress dashboard
```

### `/src/store` - State Management
```
store/
└── learning-store.ts           # Zustand store with:
    ├── Types definition
    ├── Store interface
    ├── Actions implementation
    ├── Selectors
    └── Persistence config
```

## 🎨 Component Architecture

### Component Patterns

#### 1. Presentational Components
```typescript
// Solo props, no state management
interface ModuleCardProps {
  module: LearningModule
  onStart: (module: LearningModule) => void
}

export function ModuleCard({ module, onStart }: ModuleCardProps) {
  return (
    <Card>
      <CardContent>
        {/* UI rendering only */}
      </CardContent>
    </Card>
  )
}
```

#### 2. Container Components
```typescript
// Conectan con store, manejan lógica
export function LearningDashboard() {
  const { modules, user } = useLearningStore()
  const handleModuleSelect = useModuleSelection()
  
  return (
    <div>
      {modules.map(module => (
        <ModuleCard 
          key={module.id}
          module={module}
          onStart={handleModuleSelect}
        />
      ))}
    </div>
  )
}
```

#### 3. Custom Hooks Pattern
```typescript
// Lógica reutilizable
export const useModuleSelection = () => {
  const { setSelectedModule, setCurrentLesson } = useLearningStore()
  
  return useCallback((module: LearningModule) => {
    setSelectedModule(module)
    if (module.lessons?.length) {
      setCurrentLesson(module.lessons[0])
    }
  }, [setSelectedModule, setCurrentLesson])
}
```

## 🗄️ Database Architecture

### Schema Design Principles

#### 1. Normalization
- Eliminación de datos redundantes
- Relaciones bien definidas
- Índices optimizados para consultas frecuentes

#### 2. Scalability Considerations
```sql
-- Índices compuestos para consultas comunes
CREATE INDEX idx_user_progress_lesson 
ON user_progress(userId, lessonId);

CREATE INDEX idx_exercises_lesson_order 
ON exercises(lessonId, order);
```

#### 3. Data Integrity
```typescript
// Validaciones a nivel de modelo
model UserProgress {
  userId       String
  lessonId     String?
  moduleId     String?
  
  @@unique([userId, moduleId])
  @@unique([userId, lessonId])
}
```

## 🤖 AI Integration Architecture

### 1. Service Layer Pattern
```typescript
// src/services/ai-service.ts
export class AIService {
  static async generateContent(params: GenerationParams) {
    const cached = await ContentCache.get(params)
    if (cached) return cached
    
    const response = await this.callAI(params)
    await ContentCache.set(params, response)
    return response
  }
}
```

### 2. Prompt Engineering Strategy
```typescript
const systemPrompts = {
  vocabulary: `You are an expert English teacher specializing in technical vocabulary...`,
  grammar: `You are an expert grammar teacher for software developers...`,
  // Context-specific prompts for each content type
}
```

### 3. Error Handling & Fallbacks
```typescript
export async function safeAICall(prompt: string) {
  try {
    return await ai.generate(prompt)
  } catch (error) {
    logger.error('AI call failed', error)
    return getFallbackContent(prompt)
  }
}
```

## 🔒 Security Architecture

### 1. Input Validation
```typescript
// API Route validation
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  if (!body.prompt || body.prompt.length > 1000) {
    return NextResponse.json(
      { error: 'Invalid prompt' }, 
      { status: 400 }
    )
  }
}
```

### 2. Rate Limiting (Future)
```typescript
// Middleware para rate limiting
export async function rateLimit(req: NextRequest) {
  const ip = req.ip
  const limit = await checkRateLimit(ip)
  
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
}
```

### 3. Data Sanitization
```typescript
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS
    .substring(0, 1000)   // Length limit
}
```

## 📊 Performance Optimization

### 1. Component Optimization
```typescript
// React.memo para evitar re-renders innecesarios
export const ModuleCard = React.memo(({ module, onStart }: ModuleCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.module.id === nextProps.module.id
})
```

### 2. State Optimization
```typescript
// Selectors granulares para evitar suscripciones innecesarias
export const useUserProgress = (lessonId: string) =>
  useLearningStore(
    useCallback(state => 
      state.userProgress.find(p => p.lessonId === lessonId),
      [lessonId]
    )
  )
```

### 3. Code Splitting
```typescript
// Lazy loading de componentes pesados
const LessonPlayer = lazy(() => import('@/components/exercises/lesson-player'))

// Usage con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LessonPlayer lesson={lesson} />
</Suspense>
```

## 🔄 Caching Strategy

### 1. Client-Side Caching
```typescript
// Zustand persist middleware
export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({ /* store implementation */ }),
    {
      name: 'learning-store',
      partialize: (state) => ({
        user: state.user,
        userProgress: state.userProgress,
        // Solo persistir datos esenciales
      })
    }
  )
)
```

### 2. Server-Side Caching
```typescript
// Content cache para AI responses
model ContentCache {
  prompt       String
  response     String
  contentType  String
  level        Level
  expiresAt    DateTime
  
  @@index([contentType, level])
}
```

### 3. HTTP Caching
```typescript
// API responses con cache headers
export async function GET() {
  const data = await getCachedModules()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

## 🧪 Testing Strategy

### 1. Unit Testing (Future)
```typescript
// Test de store actions
describe('LearningStore', () => {
  it('should update progress correctly', () => {
    const { result } = renderHook(() => useLearningStore())
    
    act(() => {
      result.current.updateProgress(mockProgress)
    })
    
    expect(result.current.userProgress).toContain(mockProgress)
  })
})
```

### 2. Integration Testing (Future)
```typescript
// Test de API endpoints
describe('/api/ai/generate', () => {
  it('should generate content successfully', async () => {
    const response = await POST({
      json: () => ({ prompt: 'Test prompt', type: 'vocabulary' })
    } as NextRequest)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### 3. E2E Testing (Future)
```typescript
// Cypress/Playwright tests
describe('Learning Flow', () => {
  it('should complete full lesson flow', () => {
    cy.visit('/')
    cy.get('[data-testid="module-card"]').first().click()
    cy.get('[data-testid="exercise"]').should('be.visible')
    // ... complete flow
  })
})
```

## 🚀 Deployment Architecture

### 1. Build Optimization
```javascript
// next.config.ts
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  images: {
    domains: ['cdn.techenglish.com'],
    formats: ['image/webp', 'image/avif']
  }
}
```

### 2. Environment Configuration
```typescript
// Variables de entorno
const config = {
  database: process.env.DATABASE_URL,
  aiApiKey: process.env.AI_API_KEY,
  nodeEnv: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production'
}
```

### 3. Monitoring Strategy (Future)
```typescript
// Error tracking
export function reportError(error: Error, context?: any) {
  if (config.isProduction) {
    // Sentry, LogRocket, etc.
    errorReporting.captureException(error, { context })
  } else {
    console.error('Development error:', error, context)
  }
}
```

## 📈 Scalability Considerations

### 1. Database Scaling
- **Read Replicas**: Para consultas de progreso
- **Connection Pooling**: Para manejar alta concurrencia
- **Partitioning**: Por usuario para tablas grandes

### 2. API Scaling
- **Rate Limiting**: Por usuario y por endpoint
- **Load Balancing**: Múltiples instancias de API
- **CDN**: Para contenido estático y assets

### 3. AI Service Scaling
- **Queue System**: Para generación asíncrona de contenido
- **Fallback Providers**: Múltiples proveedores de IA
- **Smart Caching**: Reducir llamadas a APIs externas

---

Esta arquitectura está diseñada para evolucionar con las necesidades del negocio, manteniendo siempre la calidad del código y la experiencia del usuario como prioridades principales.