import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for query parameters
const modulesQuerySchema = z.object({
  levelCode: z.string().optional(),
  includeLessons: z
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
    const queryParams = modulesQuerySchema.parse({
      levelCode: searchParams.get("levelCode") || undefined,
      includeLessons: searchParams.get("includeLessons") || undefined,
      includeStats: searchParams.get("includeStats") || undefined,
    });

    // Base query for modules
    const modulesQuery: any = {
      where: {
        isActive: true,
        ...(queryParams.levelCode && {
          level: { code: queryParams.levelCode },
        }),
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        order: true,
        estimatedMinutes: true,
        skills: true,
        prerequisites: true,
        isPremium: true,
        level: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    };

    // Add lessons if requested
    if (queryParams.includeLessons) {
      modulesQuery.include = {
        lessons: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            duration: true,
            difficulty: true,
            order: true,
          },
        },
      };
    }

    const modules = (await client.module.findMany(modulesQuery)) as any;

    // Transform JSON strings back to arrays
    const transformedModules = modules.map((module: any) => ({
      ...module,
      skills: JSON.parse(module.skills as string),
      prerequisites: JSON.parse(module.prerequisites as string),
      ...(queryParams.includeLessons && {
        lessons: module.lessons?.map((lesson: any) => ({
          ...lesson,
          content: lesson.content ? JSON.parse(lesson.content as string) : null,
        })),
      }),
    }));

    return NextResponse.json({
      success: true,
      data: transformedModules,
      meta: {
        total: transformedModules.length,
        filters: {
          levelCode: queryParams.levelCode || null,
        },
        includes: {
          lessons: !!queryParams.includeLessons,
          stats: !!queryParams.includeStats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching modules:", error);

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
        error: "Failed to fetch modules",
      },
      { status: 500 }
    );
  }
}
