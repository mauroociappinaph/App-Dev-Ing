import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/middleware";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for level creation
const createLevelSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  order: z.number().min(1),
  prerequisites: z.array(z.string()).default([]),
  estimatedHours: z.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if ("response" in authResult) {
      return authResult.response;
    }

    const client = prisma;

    // Parse request body
    const body = await request.json();
    const validatedData = createLevelSchema.parse(body);

    // Check if level code already exists
    const existingLevel = await client.level.findUnique({
      where: { code: validatedData.code },
    });

    if (existingLevel) {
      return NextResponse.json(
        {
          success: false,
          error: "Level code already exists",
        },
        { status: 409 }
      );
    }

    // Create new level
    const level = await client.level.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description,
        order: validatedData.order,
        prerequisites: JSON.stringify(validatedData.prerequisites),
        estimatedHours: validatedData.estimatedHours,
      },
    });

    // Transform response
    const transformedLevel = {
      ...level,
      prerequisites: JSON.parse(level.prerequisites as string),
    };

    return NextResponse.json({
      success: true,
      data: transformedLevel,
    });
  } catch (error) {
    console.error("Error creating level:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid level data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create level",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if ("response" in authResult) {
      return authResult.response;
    }

    const client = prisma;

    // Get all levels (including inactive for admin)
    const levels = await client.level.findMany({
      orderBy: { order: "asc" },
    });

    // Transform prerequisites from JSON strings back to arrays
    const transformedLevels = levels.map((level) => ({
      ...level,
      prerequisites: JSON.parse(level.prerequisites as string),
    }));

    return NextResponse.json({
      success: true,
      data: transformedLevels,
      meta: {
        total: transformedLevels.length,
      },
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch levels",
      },
      { status: 500 }
    );
  }
}
