# 🧭 TechEnglish Pro - Curriculum Implementation Plan

## 📋 **Resumen Ejecutivo**

Este documento detalla la implementación completa del sistema de curriculum para TechEnglish Pro, una aplicación de aprendizaje de inglés técnico para desarrolladores. El plan abarca desde la arquitectura de datos hasta la interfaz de usuario final, siguiendo las mejores prácticas de desarrollo.

**Alcance:** Implementación completa de 96 lecciones distribuidas en 16 módulos y 6 niveles (A1-C2), con sistema de gamificación, administración de contenido y soporte multi-asset.

---

## 🏗️ **Arquitectura Técnica**

### **Base de Datos**

- **Primaria:** PostgreSQL (producción, staging)
- **Desarrollo:** SQLite (entornos locales, pruebas rápidas)
- **Características:** JSONB para metadatos complejos, índices optimizados, replicación

### **Almacenamiento de Assets**

- **Object Storage:** S3-compatible (AWS S3, DigitalOcean Spaces, Backblaze)
- **CDN:** Cloudflare o similar para distribución global
- **Seguridad:** URLs firmadas para contenido premium

### **API Architecture**

- **Endpoints Públicos:** `/api/v1/public/*` (lectura de curriculum, lecciones, progreso)
- **Endpoints Privados:** `/api/v1/private/*` (progreso usuario autenticado)
- **Admin API:** `/api/v1/admin/*` (gestión de contenido, analytics)
- **Autenticación:** JWT + roles (user, editor, admin)

### **Progreso y Gamification**

- **Acceso Flexible:** Navegación libre entre módulos
- **Certificación:** 70% completitud + pruebas para badges oficiales
- **Placement Test:** Opcional para ubicación inicial
- **XP System:** Completitud, velocidad, dificultad

---

## 📚 **Estructura de Datos del Curriculum**

### **Jerarquía Completa**

```
Levels (6) → Modules (16) → Lessons (96) → Exercises (480+) → Assets
```

### **Modelos de Datos Principales**

#### **Levels**

```typescript
interface Level {
  id: string;
  code: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  name: string;
  description: string;
  order: number;
  prerequisites: string[]; // level IDs
  estimatedHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Modules**

```typescript
interface LearningModule {
  id: string;
  levelId: string;
  title: string;
  description: string;
  type:
    | "VOCABULARY"
    | "GRAMMAR"
    | "READING"
    | "LISTENING"
    | "SPEAKING"
    | "WRITING";
  order: number;
  isPremium: boolean;
  estimatedMinutes: number;
  skills: ("listening" | "speaking" | "reading" | "writing")[];
  prerequisites: string[]; // module IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Lessons**

```typescript
interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: {
    introduction: string;
    objectives: string[];
    keyVocabulary: VocabularyItem[];
    grammarFocus: GrammarRule[];
    culturalNotes?: string[];
  };
  type:
    | "MULTIPLE_CHOICE"
    | "FILL_BLANK"
    | "TRANSLATION"
    | "LISTENING_COMPREHENSION"
    | "SPEAKING_PRACTICE"
    | "CODE_REVIEW"
    | "EMAIL_WRITING"
    | "MEETING_SIMULATION";
  order: number;
  duration: number; // minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  exercises: Exercise[];
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Exercises**

```typescript
interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  content: {
    text?: string;
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    options?: string[];
    codeSnippet?: string;
    context?: string;
  };
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
  difficulty: number;
  xpReward: number;
  timeLimit?: number; // seconds
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **User Progress**

```typescript
interface UserProgress {
  id: string;
  userId: string;
  levelId?: string;
  moduleId?: string;
  lessonId?: string;
  exerciseId?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
  score?: number;
  timeSpent: number;
  attempts: number;
  bestScore?: number;
  completedAt?: Date;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Assets**

```typescript
interface Asset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/video
  metadata: Record<string, any>; // JSONB field
  uploadedBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 **Temario Completo - TechEnglish Pro**

### **🟢 Nivel A1 – Foundation / Beginner**

**Enfoque:** Comprensión y uso de frases básicas en contextos laborales.

#### **Módulo 1: Getting Started**

- Lección 1: Greetings & introductions
- Lección 2: Personal information
- Lección 3: Verb to be
- Lección 4: Articles and nouns
- Lección 5: Numbers, dates, and times
- Lección 6: Basic IT vocabulary

#### **Módulo 2: Everyday Work Life**

- Lección 1: Daily routines
- Lección 2: Simple present tense
- Lección 3: Time expressions
- Lección 4: Workplace vocabulary
- Lección 5: Tools & platforms
- Lección 6: Instructions in English

#### **Módulo 3: The Work Environment**

- Lección 1: Describing places
- Lección 2: Prepositions of place
- Lección 3: Company roles
- Lección 4: Saying what you do
- Lección 5: Short job-related messages
- Lección 6: Common abbreviations

### **🟡 Nivel A2 – Elementary**

**Enfoque:** Comunicación sobre proyectos y responsabilidades.

#### **Módulo 4: Projects and Collaboration**

- Lección 1: Present simple review
- Lección 2: Describing your work
- Lección 3: Tools & frameworks vocabulary
- Lección 4: Talking about team tasks
- Lección 5: Simple email communication
- Lección 6: Common meeting expressions

#### **Módulo 5: Problem Solving & Debugging**

- Lección 1: Verb can/can't for ability
- Lección 2: Explaining issues
- Lección 3: Cause and effect
- Lección 4: Instructions in sequence
- Lección 5: Error vocabulary
- Lección 6: Common phrases

#### **Módulo 6: Communication at Work**

- Lección 1: Making requests
- Lección 2: Giving suggestions
- Lección 3: Accepting/rejecting ideas
- Lección 4: Scheduling meetings
- Lección 5: Small talk in tech teams
- Lección 6: Future plans

### **🔵 Nivel B1 – Intermediate**

**Enfoque:** Describir proyectos, código y decisiones técnicas.

#### **Módulo 7: Explaining Your Code**

- Lección 1: Present continuous
- Lección 2: Present perfect
- Lección 3: Passive voice
- Lección 4: Database vocabulary
- Lección 5: Describing architecture
- Lección 6: Documenting work

#### **Módulo 8: Collaboration & Feedback**

- Lección 1: Giving feedback
- Lección 2: Agreeing/disagreeing
- Lección 3: Expressing opinions
- Lección 4: Conditionals type 1
- Lección 5: Code review vocabulary
- Lección 6: Writing pull request comments

#### **Módulo 9: Meetings & Presentations**

- Lección 1: Explaining progress
- Lección 2: Reporting blockers
- Lección 3: Modal verbs for suggestions
- Lección 4: Giving summaries
- Lección 5: Presentation vocabulary
- Lección 6: Stand-up meetings

### **🟣 Nivel B2 – Upper Intermediate**

**Enfoque:** Debatir y justificar decisiones técnicas.

#### **Módulo 10: Advanced Tech Discussions**

- Lección 1: Past continuous & past perfect
- Lección 2: Modal verbs of probability
- Lección 3: Cause and effect precisely
- Lección 4: Architecture trade-offs
- Lección 5: Comparing technologies
- Lección 6: Performance optimization

#### **Módulo 11: Documentation & Technical Writing**

- Lección 1: Documentation structure
- Lección 2: Writing API docs
- Lección 3: Explaining concepts
- Lección 4: Clarity and conciseness
- Lección 5: Markdown formatting
- Lección 6: Editing technical texts

#### **Módulo 12: Interviews & Professional Communication**

- Lección 1: Talking about experience
- Lección 2: Explaining projects
- Lección 3: STAR method
- Lección 4: Common interview questions
- Lección 5: Workplace idioms
- Lección 6: Resume and LinkedIn in English

### **🔴 Nivel C1 – Advanced / Fluent Professional**

**Enfoque:** Liderar conversaciones y proyectos en inglés.

#### **Módulo 13: Technical Leadership & Collaboration**

- Lección 1: Managing a team
- Lección 2: Giving/receiving feedback
- Lección 3: Negotiating deadlines
- Lección 4: Diplomatic language
- Lección 5: Writing team updates
- Lección 6: Hosting retrospectives

#### **Módulo 14: Tech Ecosystem & Industry Topics**

- Lección 1: Cloud & DevOps vocabulary
- Lección 2: Cybersecurity discussions
- Lección 3: AI, ML & data concepts
- Lección 4: Ethics & sustainability
- Lección 5: Reading tech articles
- Lección 6: International conferences

### **⚫ Nivel C2 – Expert / Near-native Mastery**

**Enfoque:** Comunicación natural y precisa.

#### **Módulo 15: Mastering Nuance & Style**

- Lección 1: Complex conditionals
- Lección 2: Phrasal verbs in tech
- Lección 3: Idiomatic expressions
- Lección 4: Advanced connectors
- Lección 5: Persuasive proposals
- Lección 6: Translating technical nuance

#### **Módulo 16: Thought Leadership & Global Communication**

- Lección 1: Speaking at conferences
- Lección 2: Writing technical blogs
- Lección 3: Open-source discussions
- Lección 4: Client meetings
- Lección 5: Cultural fluency
- Lección 6: Mentoring in English

---

## 🚀 **Fases de Implementación Detalladas**

### **FASE 1: Data Architecture & Migration**

**Rama:** `feat/curriculum-data-architecture`
**Duración:** 1-2 semanas

#### **Objetivos:**

- Migrar de SQLite a PostgreSQL
- Crear esquemas de BD completos
- Implementar modelos TypeScript
- Configurar conexiones duales

#### **Tareas Técnicas:**

1. **Configuración PostgreSQL**

   ```bash
   # Docker setup
   docker run --name techenglish-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:15

   # Environment variables
   DATABASE_URL="postgresql://user:password@localhost:5432/techenglish"
   DATABASE_URL_DEV="file:./dev.db"
   ```

2. **Esquemas de Base de Datos**

   ```sql
   -- Levels table
   CREATE TABLE levels (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     code VARCHAR(2) NOT NULL UNIQUE,
     name VARCHAR(100) NOT NULL,
     description TEXT,
     "order" INTEGER NOT NULL,
     prerequisites UUID[],
     estimated_hours INTEGER DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Modules table
   CREATE TABLE modules (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     level_id UUID REFERENCES levels(id),
     title VARCHAR(200) NOT NULL,
     description TEXT,
     type VARCHAR(50) NOT NULL,
     "order" INTEGER NOT NULL,
     is_premium BOOLEAN DEFAULT false,
     estimated_minutes INTEGER DEFAULT 0,
     skills TEXT[],
     prerequisites UUID[],
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Lessons table
   CREATE TABLE lessons (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     module_id UUID REFERENCES modules(id),
     title VARCHAR(200) NOT NULL,
     description TEXT,
     content JSONB,
     type VARCHAR(50) NOT NULL,
     "order" INTEGER NOT NULL,
     duration INTEGER DEFAULT 15,
     difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
     audio_url VARCHAR(500),
     video_url VARCHAR(500),
     image_url VARCHAR(500),
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Exercises table
   CREATE TABLE exercises (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     lesson_id UUID REFERENCES lessons(id),
     type VARCHAR(50) NOT NULL,
     question TEXT NOT NULL,
     content JSONB,
     correct_answer JSONB,
     explanation TEXT,
     hints TEXT[],
     difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
     xp_reward INTEGER DEFAULT 10,
     time_limit INTEGER,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- User progress table
   CREATE TABLE user_progress (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     level_id UUID REFERENCES levels(id),
     module_id UUID REFERENCES modules(id),
     lesson_id UUID REFERENCES lessons(id),
     exercise_id UUID REFERENCES exercises(id),
     status VARCHAR(20) DEFAULT 'NOT_STARTED',
     score DECIMAL(5,2),
     time_spent INTEGER DEFAULT 0,
     attempts INTEGER DEFAULT 0,
     best_score DECIMAL(5,2),
     completed_at TIMESTAMP,
     xp_earned INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Assets table
   CREATE TABLE assets (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     filename VARCHAR(255) NOT NULL,
     original_name VARCHAR(255) NOT NULL,
     mime_type VARCHAR(100) NOT NULL,
     size BIGINT NOT NULL,
     url VARCHAR(500) NOT NULL,
     thumbnail_url VARCHAR(500),
     duration INTEGER, -- for audio/video
     metadata JSONB DEFAULT '{}',
     uploaded_by UUID NOT NULL,
     is_public BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Modelos TypeScript con Prisma**

   ```prisma
   // schema.prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model Level {
     id             String   @id @default(uuid())
     code           String   @unique @db.VarChar(2)
     name           String   @db.VarChar(100)
     description    String?
     order          Int
     prerequisites  String[]
     estimatedHours Int      @default(0) @map("estimated_hours")
     isActive       Boolean  @default(true) @map("is_active")
     createdAt      DateTime @default(now()) @map("created_at")
     updatedAt      DateTime @updatedAt @map("updated_at")

     modules Module[]
     @@map("levels")
   }

   model Module {
     id             String   @id @default(uuid())
     levelId        String   @map("level_id")
     level          Level    @relation(fields: [levelId], references: [id])
     title          String   @db.VarChar(200)
     description    String?
     type           String   @db.VarChar(50)
     order          Int
     isPremium      Boolean  @default(false) @map("is_premium")
     estimatedMinutes Int    @default(0) @map("estimated_minutes")
     skills         String[]
     prerequisites  String[]
     isActive       Boolean  @default(true) @map("is_active")
     createdAt      DateTime @default(now()) @map("created_at")
     updatedAt      DateTime @updatedAt @map("updated_at")

     lessons Lesson[]
     @@map("modules")
   }

   model Lesson {
     id          String    @id @default(uuid())
     moduleId    String    @map("module_id")
     module      Module    @relation(fields: [moduleId], references: [id])
     title       String    @db.VarChar(200)
     description String?
     content     Json?
     type        String    @db.VarChar(50)
     order       Int
     duration    Int       @default(15)
     difficulty  Int?
     audioUrl    String?   @map("audio_url") @db.VarChar(500)
     videoUrl    String?   @map("video_url") @db.VarChar(500)
     imageUrl    String?   @map("image_url") @db.VarChar(500)
     isActive    Boolean   @default(true) @map("is_active")
     createdAt   DateTime  @default(now()) @map("created_at")
     updatedAt   DateTime  @updatedAt @map("updated_at")

     exercises Exercise[]
     @@map("lessons")
   }

   model Exercise {
     id           String   @id @default(uuid())
     lessonId     String   @map("lesson_id")
     lesson       Lesson   @relation(fields: [lessonId], references: [id])
     type         String   @db.VarChar(50)
     question     String
     content      Json?
     correctAnswer Json?   @map("correct_answer")
     explanation  String?
     hints        String[]
     difficulty   Int?
     xpReward     Int      @default(10) @map("xp_reward")
     timeLimit    Int?     @map("time_limit")
     isActive     Boolean  @default(true) @map("is_active")
     createdAt    DateTime @default(now()) @map("created_at")
     updatedAt    DateTime @updatedAt @map("updated_at")

     @@map("exercises")
   }

   model UserProgress {
     id          String   @id @default(uuid())
     userId      String   @map("user_id")
     levelId     String?  @map("level_id")
     moduleId    String?  @map("module_id")
     lessonId    String?  @map("lesson_id")
     exerciseId  String?  @map("exercise_id")
     status      String   @default("NOT_STARTED") @db.VarChar(20)
     score       Decimal? @db.Decimal(5, 2)
     timeSpent   Int      @default(0) @map("time_spent")
     attempts    Int      @default(0)
     bestScore   Decimal? @db.Decimal(5, 2) @map("best_score")
     completedAt DateTime? @map("completed_at")
     xpEarned    Int      @default(0) @map("xp_earned")
     createdAt   DateTime @default(now()) @map("created_at")
     updatedAt   DateTime @updatedAt @map("updated_at")

     @@map("user_progress")
   }

   model Asset {
     id           String   @id @default(uuid())
     filename     String   @db.VarChar(255)
     originalName String   @db.VarChar(255) @map("original_name")
     mimeType     String   @db.VarChar(100) @map("mime_type")
     size         BigInt
     url          String   @db.VarChar(500)
     thumbnailUrl String?  @map("thumbnail_url") @db.VarChar(500)
     duration     Int?
     metadata     Json     @default("{}")
     uploadedBy   String   @map("uploaded_by")
     isPublic     Boolean  @default(true) @map("is_public")
     createdAt    DateTime @default(now()) @map("created_at")
     updatedAt    DateTime @updatedAt @map("updated_at")

     @@map("assets")
   }
   ```

4. **Conexiones Duales**

   ```typescript
   // lib/db.ts
   import { PrismaClient } from "@prisma/client";

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined;
   };

   export const prisma = globalForPrisma.prisma ?? new PrismaClient();

   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

   // For development SQLite
   export const prismaDev = new PrismaClient({
     datasourceUrl: process.env.DATABASE_URL_DEV,
   });
   ```

### **FASE 2: API Endpoints & Authentication**

**Rama:** `feat/curriculum-api-endpoints`
**Duración:** 1-2 semanas

#### **Objetivos:**

- Implementar API completa
- Sistema de autenticación con roles
- Endpoints públicos y admin
- Rate limiting y seguridad

#### **Tareas Técnicas:**

1. **Autenticación & Autorización**

   ```typescript
   // lib/auth.ts
   import NextAuth from "next-auth";
   import { JWT } from "next-auth/jwt";

   export interface CustomUser {
     id: string;
     email: string;
     name?: string;
     role: "user" | "editor" | "admin";
   }

   export interface CustomJWT extends JWT {
     role: string;
   }
   ```

2. **Public API Endpoints**

   ```typescript
   // app/api/v1/public/levels/route.ts
   export async function GET() {
     try {
       const levels = await prisma.level.findMany({
         where: { isActive: true },
         orderBy: { order: "asc" },
         select: {
           id: true,
           code: true,
           name: true,
           description: true,
           estimatedHours: true,
         },
       });
       return NextResponse.json(levels);
     } catch (error) {
       return NextResponse.json(
         { error: "Failed to fetch levels" },
         { status: 500 }
       );
     }
   }
   ```

3. **Private API Endpoints**

   ```typescript
   // app/api/v1/private/progress/route.ts
   export async function GET(request: Request) {
     try {
       const session = await getServerSession(authOptions);
       if (!session?.user?.id) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

       const progress = await prisma.userProgress.findMany({
         where: { userId: session.user.id },
         include: {
           level: true,
           module: true,
           lesson: true,
           exercise: true,
         },
       });

       return NextResponse.json(progress);
     } catch (error) {
       return NextResponse.json(
         { error: "Failed to fetch progress" },
         { status: 500 }
       );
     }
   }
   ```

4. **Admin API Endpoints**

   ```typescript
   // app/api/v1/admin/lessons/route.ts
   export async function POST(request: Request) {
     try {
       const session = await getServerSession(authOptions);
       if (
         session?.user?.role !== "admin" &&
         session?.user?.role !== "editor"
       ) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }

       const body = await request.json();
       const lesson = await prisma.lesson.create({
         data: {
           ...body,
           createdAt: new Date(),
           updatedAt: new Date(),
         },
       });

       return NextResponse.json(lesson, { status: 201 });
     } catch (error) {
       return NextResponse.json(
         { error: "Failed to create lesson" },
         { status: 500 }
       );
     }
   }
   ```

### **FASE 3: Curriculum UI & Navigation**

**Rama:** `feat/curriculum-ui-navigation`
**Duración:** 1-2 semanas

#### **Objetivos:**

- UI completa para navegación del curriculum
- Sistema de progreso visual
- Lesson player mejorado
- Responsive design

#### **Componentes Principales:**

1. **Curriculum Browser**

   ```typescript
   // components/curriculum/curriculum-browser.tsx
   interface CurriculumBrowserProps {
     onModuleSelect: (module: LearningModule) => void;
     userProgress: UserProgress[];
   }

   export function CurriculumBrowser({
     onModuleSelect,
     userProgress,
   }: CurriculumBrowserProps) {
     // Implementation for level/module navigation
   }
   ```

2. **Lesson Player Enhancement**

   ```typescript
   // components/curriculum/lesson-player.tsx
   interface EnhancedLessonPlayerProps {
     lesson: Lesson;
     exercises: Exercise[];
     onProgress: (progress: UserProgress) => void;
     onComplete: () => void;
   }

   export function EnhancedLessonPlayer({
     lesson,
     exercises,
     onProgress,
     onComplete,
   }: EnhancedLessonPlayerProps) {
     // Enhanced player with audio/video support
   }
   ```

3. **Progress Visualization**

   ```typescript
   // components/progress/curriculum-progress.tsx
   interface CurriculumProgressProps {
     levels: Level[];
     modules: LearningModule[];
     userProgress: UserProgress[];
   }

   export function CurriculumProgress({
     levels,
     modules,
     userProgress,
   }: CurriculumProgressProps) {
     // Visual progress tracking
   }
   ```

### **FASE 4: Content Management & Seeding**

**Rama:** `feat/curriculum-content-management`
**Duración:** 1-2 semanas

#### **Objetivos:**

- Sistema de seeders completo
- Admin panel básico
- Content validation
- Asset management

#### **Seeders System:**

```typescript
// scripts/seed-curriculum.ts
import { PrismaClient } from "@prisma/client";
import { curriculumData } from "../data/curriculum-seed.json";

const prisma = new PrismaClient();

async function seedCurriculum() {
  console.log("🌱 Seeding curriculum data...");

  // Seed levels
  for (const level of curriculumData.levels) {
    await prisma.level.upsert({
      where: { code: level.code },
      update: level,
      create: level,
    });
  }

  // Seed modules, lessons, exercises...
  console.log("✅ Curriculum seeded successfully!");
}

seedCurriculum()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **FASE 5: Advanced Features & Optimization**

**Rama:** `feat/curriculum-advanced-features`
**Duración:** 1-2 semanas

#### **Objetivos:**

- Gamification completa
- Performance optimization
- Analytics básico
- Testing coverage

#### **Gamification System:**

```typescript
// lib/gamification.ts
export class GamificationEngine {
  static calculateXP(
    action: string,
    difficulty: number,
    timeSpent: number
  ): number {
    let baseXP = 10;

    // Difficulty multiplier
    baseXP *= difficulty;

    // Time bonus (faster completion = more XP)
    if (timeSpent < 60) baseXP *= 1.5;
    else if (timeSpent < 120) baseXP *= 1.2;

    return Math.round(baseXP);
  }

  static checkAchievements(
    userId: string,
    progress: UserProgress[]
  ): Achievement[] {
    // Achievement logic implementation
  }
}
```

---

## 📅 **Cronograma Detallado**

### **Semana 1-2: Fase 1** (Data Architecture)

- ✅ PostgreSQL setup y migración
- ✅ Esquemas de BD completos
- ✅ Modelos TypeScript con Prisma
- ✅ Conexiones duales (SQLite/PostgreSQL)

### **Semana 3-4: Fase 2** (API & Auth)

- ✅ Sistema de autenticación JWT + roles
- ✅ API endpoints públicos, privados y admin
- ✅ Rate limiting y validación de seguridad
- ✅ Testing de endpoints

### **Semana 5-6: Fase 3** (UI & Navigation)

- ✅ Curriculum browser completo
- ✅ Lesson player con audio/video
- ✅ Sistema de progreso visual
- ✅ Diseño responsive

### **Semana 7-8: Fase 4** (Content Management)

- ✅ Seeders completos para 96 lecciones
- ✅ Admin panel básico
- ✅ Validación de contenido
- ✅ Gestión de assets

### **Semana 9-10: Fase 5** (Advanced Features)

- ✅ Gamification completa
- ✅ Optimización de performance
- ✅ Analytics básico
- ✅ Cobertura de testing >80%

---

## 🛠️ **Tecnologías y Herramientas**

### **Backend:**

- **Database:** PostgreSQL + SQLite (desarrollo)
- **ORM:** Prisma con aceleración
- **API:** Next.js API Routes
- **Auth:** NextAuth.js con JWT
- **Validation:** Zod schemas
- **File Upload:** Multer + S3 SDK

### **Frontend:**

- **State Management:** Zustand (ya implementado)
- **UI Components:** shadcn/ui (ya configurado)
- **Forms:** React Hook Form + Zod
- **Audio/Video:** HTML5 + custom controls
- **Charts:** Recharts para analytics

### **DevOps & Tools:**

- **Containerization:** Docker + Docker Compose
- **Migrations:** Prisma Migrate
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions básico

---

## 🎯 **Criterios de Éxito**

### **Funcionales:**

- ✅ Curriculum completo navegable (96 lecciones)
- ✅ Progress tracking funcional
- ✅ Gamification working
- ✅ Admin panel operativo
- ✅ Asset management completo

### **Técnicos:**

- ✅ PostgreSQL production-ready
- ✅ API segura y escalable
- ✅ Performance optimizada
- ✅ Testing coverage >80%
- ✅ Documentation completa

### **Usuario:**

- ✅ UX intuitiva y responsive
- ✅ Loading states apropiados
- ✅ Error handling user-friendly
- ✅ Accessibility WCAG 2.1 AA
- ✅ Offline-capable (PWA)

---

## 🚨 **Riesgos y Mitigaciones**

### **Riesgos Identificados:**

1. **Complejidad del Curriculum:** 96 lecciones × múltiples exercises
2. **Asset Management:** Audio/video para listening exercises
3. **Performance:** Queries complejas con JSONB
4. **Migration Complexity:** SQLite → PostgreSQL

### **Mitigaciones:**

1. **Fases Incrementales:** Implementación por módulos
2. **Seeders Automatizados:** Scripts para carga masiva
3. **CDN Strategy:** Assets servidos vía CDN
4. **Migration Testing:** Entornos separados para testing

---

## 📋 **Ramas de Desarrollo**

Cada fase tendrá su propia rama siguiendo el patrón de Git Flow:

- `feat/curriculum-data-architecture` - Fase 1
- `feat/curriculum-api-endpoints` - Fase 2
- `feat/curriculum-ui-navigation` - Fase 3
- `feat/curriculum-content-management` - Fase 4
- `feat/curriculum-advanced-features` - Fase 5

Cada rama se mergeará a `dev` cuando esté completa, y finalmente `dev` se mergeará a `master` para producción.

---

## 🎯 **Próximos Pasos**

1. **Crear rama:** `feat/curriculum-data-architecture`
2. **Configurar PostgreSQL** en Docker
3. **Crear esquemas de BD** completos
4. **Implementar modelos TypeScript**
5. **Configurar conexiones duales**

**¿Listo para comenzar con la Fase 1?** 🚀
