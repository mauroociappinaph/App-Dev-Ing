#!/usr/bin/env tsx

// Database health check script for TechEnglish Pro
// Verifies database connectivity and basic operations

import { PrismaClient } from "@prisma/client";

// Simple database health check - direct implementation
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Checking TechEnglish Pro database health...");

    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");

    // Test levels table
    const levelsCount = await prisma.level.count();
    console.log(`📊 Levels in database: ${levelsCount}`);

    // Test modules table
    const modulesCount = await prisma.module.count();
    console.log(`📚 Modules in database: ${modulesCount}`);

    // Test lessons table
    const lessonsCount = await prisma.lesson.count();
    console.log(`📝 Lessons in database: ${lessonsCount}`);

    // Test exercises table
    const exercisesCount = await prisma.exercise.count();
    console.log(`🎯 Exercises in database: ${exercisesCount}`);

    // Test users table
    const usersCount = await prisma.user.count();
    console.log(`👥 Users in database: ${usersCount}`);

    console.log("✅ All database operations successful!");
    console.log("🎉 Database is healthy and ready!");
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
