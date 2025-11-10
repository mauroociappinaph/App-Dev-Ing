// Curriculum seeding script for TechEnglish Pro
// Populates the database with the complete curriculum structure

import { getPrismaClient, disconnectDatabase } from "../lib/db";

// Curriculum data structure
const curriculumData = {
  levels: [
    {
      code: "A1",
      name: "Foundation",
      description: "Comprensión y uso de frases básicas en contextos laborales",
      order: 1,
      estimatedHours: 20,
      prerequisites: "[]", // No prerequisites for A1
    },
    {
      code: "A2",
      name: "Elementary",
      description: "Comunicación sobre proyectos y responsabilidades",
      order: 2,
      estimatedHours: 25,
      prerequisites: '["A1"]', // Requires A1 completion
    },
    {
      code: "B1",
      name: "Intermediate",
      description: "Describir proyectos, código y decisiones técnicas",
      order: 3,
      estimatedHours: 30,
      prerequisites: '["A2"]', // Requires A2 completion
    },
    {
      code: "B2",
      name: "Upper Intermediate",
      description: "Debatir y justificar decisiones técnicas",
      order: 4,
      estimatedHours: 35,
      prerequisites: '["B1"]', // Requires B1 completion
    },
    {
      code: "C1",
      name: "Advanced",
      description: "Liderar conversaciones y proyectos en inglés",
      order: 5,
      estimatedHours: 40,
      prerequisites: '["B2"]', // Requires B2 completion
    },
    {
      code: "C2",
      name: "Expert",
      description: "Comunicación natural y precisa",
      order: 6,
      estimatedHours: 45,
      prerequisites: '["C1"]', // Requires C1 completion
    },
  ],
  modules: [
    // A1 Modules
    { levelCode: "A1", title: "Getting Started", order: 1 },
    { levelCode: "A1", title: "Everyday Work Life", order: 2 },
    { levelCode: "A1", title: "The Work Environment", order: 3 },

    // A2 Modules
    { levelCode: "A2", title: "Projects and Collaboration", order: 1 },
    { levelCode: "A2", title: "Problem Solving & Debugging", order: 2 },
    { levelCode: "A2", title: "Communication at Work", order: 3 },

    // B1 Modules
    { levelCode: "B1", title: "Explaining Your Code", order: 1 },
    { levelCode: "B1", title: "Collaboration & Feedback", order: 2 },
    { levelCode: "B1", title: "Meetings & Presentations", order: 3 },

    // B2 Modules
    { levelCode: "B2", title: "Advanced Tech Discussions", order: 1 },
    { levelCode: "B2", title: "Documentation & Technical Writing", order: 2 },
    {
      levelCode: "B2",
      title: "Interviews & Professional Communication",
      order: 3,
    },

    // C1 Modules
    {
      levelCode: "C1",
      title: "Technical Leadership & Collaboration",
      order: 1,
    },
    { levelCode: "C1", title: "Tech Ecosystem & Industry Topics", order: 2 },

    // C2 Modules
    { levelCode: "C2", title: "Mastering Nuance & Style", order: 1 },
    {
      levelCode: "C2",
      title: "Thought Leadership & Global Communication",
      order: 2,
    },
  ],
};

async function seedCurriculum() {
  try {
    console.log("🌱 Seeding TechEnglish Pro curriculum...");

    const client = getPrismaClient();

    // Seed levels
    console.log("📊 Seeding levels...");
    for (const level of curriculumData.levels) {
      await client.level.upsert({
        where: { code: level.code },
        update: level,
        create: level,
      });
    }
    console.log(`✅ Seeded ${curriculumData.levels.length} levels`);

    // Seed modules
    console.log("📚 Seeding modules...");
    for (const moduleData of curriculumData.modules) {
      // Find the level ID
      const level = await client.level.findUnique({
        where: { code: moduleData.levelCode },
      });

      if (!level) {
        console.warn(
          `⚠️  Level ${moduleData.levelCode} not found, skipping module`
        );
        continue;
      }

      // Check if module already exists
      const existingModule = await client.module.findFirst({
        where: {
          levelId: level.id,
          title: moduleData.title,
        },
      });

      if (existingModule) {
        // Update existing module
        await client.module.update({
          where: { id: existingModule.id },
          data: { order: moduleData.order },
        });
      } else {
        // Create new module
        await client.module.create({
          data: {
            levelId: level.id,
            title: moduleData.title,
            description: `Módulo de nivel ${moduleData.levelCode}`,
            type: "VOCABULARY", // Default type
            order: moduleData.order,
            skills: '["listening", "speaking", "reading", "writing"]',
            prerequisites: "[]", // No prerequisites for modules
          },
        });
      }
    }

    const modulesCount = await client.module.count();
    console.log(`✅ Seeded ${modulesCount} modules`);

    // Count total records
    const levelsCount = await client.level.count();
    const lessonsCount = await client.lesson.count();
    const exercisesCount = await client.exercise.count();

    console.log("\n📊 Curriculum Summary:");
    console.log(`   Levels: ${levelsCount}`);
    console.log(`   Modules: ${modulesCount}`);
    console.log(`   Lessons: ${lessonsCount}`);
    console.log(`   Exercises: ${exercisesCount}`);

    console.log("\n✅ Curriculum seeding completed!");
    console.log("💡 Next steps:");
    console.log("   1. Run detailed lesson seeding scripts");
    console.log("   2. Add exercise content and media assets");
    console.log("   3. Configure admin panel for content management");
  } catch (error) {
    console.error("❌ Curriculum seeding failed:", error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run the seeding
seedCurriculum()
  .then(() => {
    console.log("🎉 Seeding process completed successfully!");
  })
  .catch((error) => {
    console.error("💥 Seeding process failed:", error);
    process.exit(1);
  });
