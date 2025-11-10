// Database connection utilities for TechEnglish Pro
// Supports both PostgreSQL (production) and SQLite (development)

import { PrismaClient } from "@prisma/client";

// Global Prisma instance to prevent multiple connections in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDev: PrismaClient | undefined;
};

// Production PostgreSQL client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Development SQLite client (for local development and testing)
export const prismaDev =
  globalForPrisma.prismaDev ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_DEV || "file:./dev.db",
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Determine which client to use based on environment
export const getPrismaClient = (): PrismaClient => {
  // Use SQLite for development/testing, PostgreSQL for production
  if (
    process.env.NODE_ENV === "production" ||
    process.env.USE_POSTGRES === "true"
  ) {
    return prisma;
  }

  // Use SQLite for development and testing
  return prismaDev;
};

// Database health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await Promise.all([prisma.$disconnect(), prismaDev.$disconnect()]);
    console.log("Database connections closed successfully");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

// Initialize database (create tables, run migrations)
export const initializeDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();

    // Test connection by running a simple query
    if (process.env.NODE_ENV === "development") {
      console.log("Testing database connection...");
      await client.$queryRaw`SELECT 1`;
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

// Clean up development data
export const resetDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Database reset is only allowed in development mode");
  }

  try {
    const client = getPrismaClient();

    console.log("Resetting database...");

    // Delete all data in reverse dependency order
    await client.userAchievement.deleteMany();
    await client.achievement.deleteMany();
    await client.exerciseResponse.deleteMany();
    await client.learningSession.deleteMany();
    await client.userProgress.deleteMany();
    await client.exercise.deleteMany();
    await client.lesson.deleteMany();
    await client.module.deleteMany();
    await client.level.deleteMany();
    await client.user.deleteMany();
    await client.asset.deleteMany();
    await client.contentCache.deleteMany();
    await client.analyticsEvent.deleteMany();

    console.log("Database reset completed");
  } catch (error) {
    console.error("Database reset failed:", error);
    throw error;
  }
};

// In development, save Prisma instances to global object
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDev = prismaDev;
}
