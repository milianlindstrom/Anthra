import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calculateStartDate(dueDate: Date, estimatedHours: number): Date {
  const daysNeeded = Math.ceil(estimatedHours / 8) || 1 // 8-hour workdays
  const startDate = new Date(dueDate)
  startDate.setDate(startDate.getDate() - daysNeeded)
  return startDate
}

async function main() {
  console.log('🌱 Seeding database with projects and tasks...\n')

  // Clear existing data
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  // Create Projects
  console.log('📦 Creating projects...')
  
  const clyqraProject = await prisma.project.create({
    data: {
      name: 'Clyqra',
      slug: 'clyqra',
      description: 'SaaS platform for team collaboration and project management',
      color: '#6366f1', // indigo
      icon: '🚀',
    },
  })
  console.log('   ✓ 🚀 Clyqra')

  const rookieProject = await prisma.project.create({
    data: {
      name: 'Rookie',
      slug: 'rookie',
      description: 'Personal blog and portfolio website',
      color: '#ec4899', // pink
      icon: '✨',
    },
  })
  console.log('   ✓ ✨ Rookie')

  const studyProject = await prisma.project.create({
    data: {
      name: 'Learning',
      slug: 'learning',
      description: 'Personal learning and skill development',
      color: '#8b5cf6', // violet
      icon: '📚',
    },
  })
  console.log('   ✓ 📚 Learning')

  const anthraProject = await prisma.project.create({
    data: {
      name: 'Anthra',
      slug: 'anthra',
      description: 'Task management system redesign',
      color: '#10b981', // emerald
      icon: '⚡',
    },
  })
  console.log('   ✓ ⚡ Anthra')

  // Create Tasks
  console.log('\n📝 Creating tasks...')

  const tasksData = [
    // Clyqra tasks
    {
      title: "Design database schema",
      description: "Create comprehensive database schema with proper relationships and indexes",
      status: "done",
      priority: "high",
      project_id: clyqraProject.id,
      estimated_hours: 4,
      due_date: new Date("2026-01-20"),
    },
    {
      title: "Implement authentication system",
      description: "Build secure authentication with JWT tokens, password hashing, and session management",
      status: "in-progress",
      priority: "high",
      project_id: clyqraProject.id,
      estimated_hours: 12,
      due_date: new Date("2026-02-05"),
    },
    {
      title: "Setup CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing, linting, and deployment to production",
      status: "todo",
      priority: "medium",
      project_id: clyqraProject.id,
      estimated_hours: 6,
      due_date: new Date("2026-02-10"),
    },
    {
      title: "Build notification system",
      description: "Real-time notifications using WebSockets for important events",
      status: "backlog",
      priority: "medium",
      project_id: clyqraProject.id,
      estimated_hours: 8,
      due_date: new Date("2026-02-15"),
    },
    {
      title: "Implement role-based access control",
      description: "Add RBAC system with customizable permissions for different user roles",
      status: "review",
      priority: "high",
      project_id: clyqraProject.id,
      estimated_hours: 10,
      due_date: new Date("2026-01-30"),
    },

    // Rookie tasks
    {
      title: "Design landing page mockup",
      description: "Create high-fidelity mockup in Figma with responsive layouts",
      status: "done",
      priority: "high",
      project_id: rookieProject.id,
      estimated_hours: 4,
      due_date: new Date("2026-01-15"),
    },
    {
      title: "Build responsive landing page",
      description: "Implement the landing page with Next.js and Tailwind CSS",
      status: "in-progress",
      priority: "high",
      project_id: rookieProject.id,
      estimated_hours: 8,
      due_date: new Date("2026-02-01"),
    },
    {
      title: "Write API documentation",
      description: "Document all API endpoints with request/response examples and authentication details",
      status: "todo",
      priority: "low",
      project_id: rookieProject.id,
      estimated_hours: 3,
      due_date: new Date("2026-02-20"),
    },
    {
      title: "Add blog CMS integration",
      description: "Integrate with a headless CMS for blog post management",
      status: "backlog",
      priority: "medium",
      project_id: rookieProject.id,
      estimated_hours: 6,
      due_date: new Date("2026-02-25"),
    },

    // Learning tasks
    {
      title: "Complete React Advanced Patterns course",
      description: "Deep dive into render props, compound components, and custom hooks patterns",
      status: "in-progress",
      priority: "medium",
      project_id: studyProject.id,
      estimated_hours: 20,
      due_date: new Date("2026-02-15"),
    },
    {
      title: "Study TypeScript generics",
      description: "Master generic types, constraints, and utility types in TypeScript",
      status: "todo",
      priority: "low",
      project_id: studyProject.id,
      estimated_hours: 8,
      due_date: new Date("2026-02-28"),
    },
    {
      title: "Build a fullstack clone project",
      description: "Clone a popular app to practice fullstack development skills",
      status: "backlog",
      priority: "low",
      project_id: studyProject.id,
      estimated_hours: 40,
      due_date: new Date("2026-03-15"),
    },
    {
      title: "Learn Rust basics",
      description: "Get familiar with Rust syntax, ownership model, and basic concepts",
      status: "backlog",
      priority: "low",
      project_id: studyProject.id,
      estimated_hours: 30,
      due_date: new Date("2026-03-30"),
    },

    // Anthra tasks
    {
      title: "Implement project hierarchy",
      description: "Add Projects model and update Task relationships",
      status: "done",
      priority: "high",
      project_id: anthraProject.id,
      estimated_hours: 3,
      due_date: new Date("2026-01-27"),
    },
    {
      title: "Fix Gantt chart timeline",
      description: "Properly implement start_date and due_date visualization with horizontal bars",
      status: "todo",
      priority: "high",
      project_id: anthraProject.id,
      estimated_hours: 4,
      due_date: new Date("2026-01-28"),
    },
    {
      title: "Redesign with Plane aesthetics",
      description: "Apply Plane-inspired design system throughout the application",
      status: "in-progress",
      priority: "high",
      project_id: anthraProject.id,
      estimated_hours: 6,
      due_date: new Date("2026-01-29"),
    },
    {
      title: "Add keyboard shortcuts",
      description: "Implement comprehensive keyboard shortcuts for power users",
      status: "todo",
      priority: "medium",
      project_id: anthraProject.id,
      estimated_hours: 4,
      due_date: new Date("2026-02-01"),
    },
    {
      title: "Optimize drag-and-drop performance",
      description: "Implement optimistic updates and smooth 60fps animations",
      status: "todo",
      priority: "medium",
      project_id: anthraProject.id,
      estimated_hours: 3,
      due_date: new Date("2026-02-02"),
    },
  ]

  for (const taskData of tasksData) {
    const startDate = calculateStartDate(taskData.due_date, taskData.estimated_hours)
    
    await prisma.task.create({
      data: {
        ...taskData,
        start_date: startDate,
      },
    })
  }

  console.log(`   ✓ Created ${tasksData.length} tasks`)

  // Summary
  const projectCount = await prisma.project.count()
  const taskCount = await prisma.task.count()

  console.log('\n✅ Seed complete!')
  console.log(`   Projects: ${projectCount}`)
  console.log(`   Tasks: ${taskCount}\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
