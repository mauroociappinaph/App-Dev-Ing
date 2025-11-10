import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for query parameters
const levelsQuerySchema = z.object({
  includeModules: z
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
    const queryParams = levelsQuerySchema.parse({
      includeModules: searchParams.get("includeModules") || undefined,
      includeStats: searchParams.get("includeStats") || undefined,
    });

    // Base query for levels
    const levelsQuery: any = {
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        estimatedHours: true,
        order: true,
        prerequisites: true,
      },
    };

    // Add modules if requested
    if (queryParams.includeModules) {
      levelsQuery.include = {
        modules: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            order: true,
            estimatedMinutes: true,
            skills: true,
          },
        },
      };
    }

    const levels = (await client.level.findMany(levelsQuery)) as any;

    // Transform prerequisites from JSON strings back to arrays
    const transformedLevels = levels.map((level: any) => ({
      ...level,
      prerequisites: JSON.parse(level.prerequisites as string),
      ...(queryParams.includeModules && {
        modules: level.modules?.map((module: any) => ({
          ...module,
          skills: JSON.parse(module.skills as string),
        })),
      }),
    }));

    return NextResponse.json({
      success: true,
      data: transformedLevels,
      meta: {
        total: transformedLevels.length,
        includes: {
          modules: !!queryParams.includeModules,
          stats: !!queryParams.includeStats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching levels:", error);

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
        error: "Failed to fetch levels",
      },
      { status: 500 }
    );
  }
}
