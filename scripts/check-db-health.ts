#!/usr/bin/env tsx

// Database health check script for TechEnglish Pro
// Verifies database connectivity and basic operations

import {
  checkDatabaseConnection,
  getPrismaClient,
  disconnectDatabase,
} from "../lib/db";

async function main() {
  try {
    console.log("🔍 Checking TechEnglish Pro database health...");

    // Test basic connectivity
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    console.log("✅ Database connection successful");

    // Test basic operations
    const client = getPrismaClient();

    // Test levels table
    const levelsCount = await client.level.count();
    console.log(`📊 Levels in database: ${levelsCount}`);

    // Test modules table
    const modulesCount = await client.module.count();
    console.log(`📚 Modules in database: ${modulesCount}`);

    // Test lessons table
    const lessonsCount = await client.lesson.count();
    console.log(`📝 Lessons in database: ${lessonsCount}`);

    // Test exercises table
    const exercisesCount = await client.exercise.count();
    console.log(`🎯 Exercises in database: ${exercisesCount}`);

    // Test users table
    const usersCount = await client.user.count();
    console.log(`👥 Users in database: ${usersCount}`);

    console.log("✅ All database operations successful!");
    console.log("🎉 Database is healthy and ready!");
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
