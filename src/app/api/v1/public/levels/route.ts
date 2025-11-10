import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "../../../../../lib/db";
import { z } from "zod";

// Validation schema for query parameters
const levelsQuerySchema = z.object({
  includeModules: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeStats: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export async function GET(request: NextRequest) {
  try {
    const client = getPrismaClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = levelsQuerySchema.parse({
      includeModules: searchParams.get("includeModules"),
      includeStats: searchParams.get("includeStats"),
    });

    // Base query for levels
    const levelsQuery = {
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
      (levelsQuery.select as any).modules = {
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
      };
    }

    // Add statistics if requested
    if (queryParams.includeStats) {
      (levelsQuery.select as any)._count = {
        select: {
          modules: true,
        },
      };
    }

    const levels = await client.level.findMany(levelsQuery);

    // Transform prerequisites from JSON strings back to arrays
    const transformedLevels = levels.map((level) => ({
      ...level,
      prerequisites: JSON.parse(level.prerequisites as string),
      ...(queryParams.includeModules && {
        modules: level.modules?.map((module) => ({
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
          details: error.errors,
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
