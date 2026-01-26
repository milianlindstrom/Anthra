import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.task.deleteMany()

  // Create example tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Design database schema",
        description: "Create the initial database schema for Ulrik",
        status: "done",
        priority: "high",
        project: "Clyqra",
        estimated_hours: 4,
        due_date: new Date("2026-01-20"),
      },
      {
        title: "Implement authentication",
        description: "Add user authentication and authorization",
        status: "in-progress",
        priority: "high",
        project: "Clyqra",
        estimated_hours: 8,
        due_date: new Date("2026-02-01"),
      },
      {
        title: "Build landing page",
        description: "Create a responsive landing page with hero section",
        status: "todo",
        priority: "medium",
        project: "Rookie",
        estimated_hours: 6,
        due_date: new Date("2026-02-10"),
      },
      {
        title: "Study React hooks",
        description: "Deep dive into useState, useEffect, and custom hooks",
        status: "in-progress",
        priority: "low",
        project: "Study",
        estimated_hours: 10,
        due_date: new Date("2026-02-15"),
      },
      {
        title: "Setup CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        status: "todo",
        priority: "medium",
        project: "Clyqra",
        estimated_hours: 5,
        due_date: new Date("2026-01-30"),
      },
      {
        title: "Write API documentation",
        description: "Document all API endpoints with examples",
        status: "todo",
        priority: "low",
        project: "Rookie",
        estimated_hours: 3,
        due_date: new Date("2026-02-20"),
      },
    ],
  })

  console.log('✅ Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
