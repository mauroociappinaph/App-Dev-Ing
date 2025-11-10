#!/usr/bin/env tsx

// Database reset script for TechEnglish Pro
// This script safely resets the database for development

import { resetDatabase, disconnectDatabase } from "../lib/db";

async function main() {
  try {
    console.log("🗑️  Resetting TechEnglish Pro database...");

    await resetDatabase();

    console.log("✅ Database reset completed successfully!");
    console.log(
      "💡 You can now run 'npm run db:seed' to populate with sample data"
    );
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
