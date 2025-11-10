import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "../../../../../lib/middleware";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for progress updates
const progressUpdateSchema = z.object({
  levelId: z.string().optional(),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  exerciseId: z.string().optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "MASTERED"])
    .optional(),
  score: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0).optional(),
  attempts: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireUser(request);
    if ("response" in authResult) {
      return authResult.response;
    }
    const { user } = authResult;

    const client = prisma;

    // Get user's progress
    const progress = await client.userProgress.findMany({
      where: { userId: user.id },
      include: {
        level: {
          select: { id: true, code: true, name: true },
        },
        module: {
          select: { id: true, title: true, level: { select: { code: true } } },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { title: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate statistics
    const stats = {
      totalModules: await client.module.count({ where: { isActive: true } }),
      completedModules: progress.filter(
        (p) => p.status === "COMPLETED" && p.moduleId
      ).length,
      totalLessons: await client.lesson.count({ where: { isActive: true } }),
      completedLessons: progress.filter(
        (p) => p.status === "COMPLETED" && p.lessonId
      ).length,
      totalXP: progress.reduce((sum, p) => sum + (p.xpEarned || 0), 0),
      currentStreak: user.streak || 0,
      averageScore:
        progress.length > 0
          ? Math.round(
              progress.reduce((sum, p) => sum + (p.score || 0), 0) /
                progress.length
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        progress,
        stats,
        user: {
          id: user.id,
          level: user.level,
          totalXP: user.totalXP,
          streak: user.streak,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progress",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireUser(request);
    if ("response" in authResult) {
      return authResult.response;
    }
    const { user } = authResult;

    const client = prisma;

    // Parse request body
    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

    // Check if progress already exists
    const existingProgress = await client.userProgress.findFirst({
      where: {
        userId: user.id,
        levelId: validatedData.levelId || null,
        moduleId: validatedData.moduleId || null,
        lessonId: validatedData.lessonId || null,
        exerciseId: validatedData.exerciseId || null,
      },
    });

    // Calculate XP reward based on completion
    let xpEarned = 0;
    if (validatedData.status === "COMPLETED") {
      if (validatedData.exerciseId) {
        const exercise = await client.exercise.findUnique({
          where: { id: validatedData.exerciseId },
          select: { xpReward: true },
        });
        xpEarned = exercise?.xpReward || 10;
      } else if (validatedData.lessonId) {
        xpEarned = 50; // Base XP for lesson completion
      } else if (validatedData.moduleId) {
        xpEarned = 100; // Base XP for module completion
      }
    }

    let progress;
    if (existingProgress) {
      // Update existing progress
      progress = await client.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          ...validatedData,
          xpEarned: xpEarned > 0 ? { increment: xpEarned } : undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new progress
      progress = await client.userProgress.create({
        data: {
          userId: user.id,
          levelId: validatedData.levelId,
          moduleId: validatedData.moduleId,
          lessonId: validatedData.lessonId,
          exerciseId: validatedData.exerciseId,
          status: validatedData.status || "NOT_STARTED",
          score: validatedData.score,
          timeSpent: validatedData.timeSpent || 0,
          attempts: validatedData.attempts || 0,
          xpEarned,
        },
      });
    }

    // Update user XP and streak if progress was completed
    if (validatedData.status === "COMPLETED") {
      await client.user.update({
        where: { id: user.id },
        data: {
          totalXP: { increment: xpEarned },
          lastActive: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
      xpEarned,
    });
  } catch (error) {
    console.error("Error updating progress:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid progress data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update progress",
      },
      { status: 500 }
    );
  }
}
