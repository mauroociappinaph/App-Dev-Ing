import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for query parameters
const lessonsQuerySchema = z.object({
  moduleId: z.string().optional(),
  levelCode: z.string().optional(),
  includeExercises: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
  includeStats: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function GET(request: NextRequest) {
  try {
    const client = prisma;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = lessonsQuerySchema.parse({
      moduleId: searchParams.get("moduleId") || undefined,
      levelCode: searchParams.get("levelCode") || undefined,
      includeExercises: searchParams.get("includeExercises") || undefined,
      includeStats: searchParams.get("includeStats") || undefined,
    });

    // Build where clause
    const whereClause: any = {
      isActive: true,
    };

    if (queryParams.moduleId) {
      whereClause.moduleId = queryParams.moduleId;
    }

    if (queryParams.levelCode) {
      whereClause.module = {
        level: { code: queryParams.levelCode },
      };
    }

    // Base query for lessons
    const lessonsQuery: any = {
      where: whereClause,
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        type: true,
        duration: true,
        difficulty: true,
        order: true,
        audioUrl: true,
        videoUrl: true,
        imageUrl: true,
        module: {
          select: {
            id: true,
            title: true,
            level: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    };

    // Add exercises if requested
    if (queryParams.includeExercises) {
      lessonsQuery.include = {
        exercises: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            type: true,
            correctAnswer: true,
            explanation: true,
            hints: true,
            difficulty: true,
            xpReward: true,
            order: true,
          },
        },
      };
    }

    const lessons = (await client.lesson.findMany(lessonsQuery)) as any;

    // Transform JSON strings back to objects
    const transformedLessons = lessons.map((lesson: any) => ({
      ...lesson,
      content: lesson.content ? JSON.parse(lesson.content as string) : null,
      ...(queryParams.includeExercises && {
        exercises: lesson.exercises?.map((exercise: any) => ({
          ...exercise,
          correctAnswer: exercise.correctAnswer
            ? JSON.parse(exercise.correctAnswer as string)
            : null,
          hints: JSON.parse(exercise.hints as string),
        })),
      }),
    }));

    return NextResponse.json({
      success: true,
      data: transformedLessons,
      meta: {
        total: transformedLessons.length,
        filters: {
          moduleId: queryParams.moduleId || null,
          levelCode: queryParams.levelCode || null,
        },
        includes: {
          exercises: !!queryParams.includeExercises,
          stats: !!queryParams.includeStats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lessons",
      },
      { status: 500 }
    );
  }
}
