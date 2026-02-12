const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with projects and tasks...\n');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  // Create Projects
  console.log('📦 Creating projects...');
  
  const clyqraProject = await prisma.project.create({
    data: {
      name: 'Clyqra',
      slug: 'clyqra',
      description: 'SaaS platform for team collaboration and project management',
      color: '#6366f1', // indigo
      icon: '🚀',
    },
  });
  console.log('   ✓ 🚀 Clyqra');

  const rookieProject = await prisma.project.create({
    data: {
      name: 'Rookie',
      slug: 'rookie',
      description: 'Personal blog and portfolio website',
      color: '#ec4899', // pink
      icon: '✨',
    },
  });
  console.log('   ✓ ✨ Rookie');

  const studyProject = await prisma.project.create({
    data: {
      name: 'Learning',
      slug: 'learning',
      description: 'Personal learning and skill development',
      color: '#8b5cf6', // violet
      icon: '📚',
    },
  });
  console.log('   ✓ 📚 Learning');

  // Create Tasks
  console.log('\n📝 Creating tasks...');

  // Clyqra tasks
  await prisma.task.create({
    data: {
      title: 'Design authentication system',
      description: 'Create login/signup flows and UI components',
      status: 'todo',
      priority: 'high',
      project_id: clyqraProject.id,
      estimated_hours: 8,
    },
  });
  console.log('   ✓ Design authentication system');

  await prisma.task.create({
    data: {
      title: 'Implement API endpoints',
      description: 'Develop RESTful API for user management',
      status: 'in-progress',
      priority: 'high',
      project_id: clyqraProject.id,
      estimated_hours: 12,
    },
  });
  console.log('   ✓ Implement API endpoints');

  // Rookie tasks
  await prisma.task.create({
    data: {
      title: 'Design homepage layout',
      description: 'Create responsive homepage design with portfolio showcase',
      status: 'todo',
      priority: 'medium',
      project_id: rookieProject.id,
      estimated_hours: 6,
    },
  });
  console.log('   ✓ Design homepage layout');

  // Learning tasks
  await prisma.task.create({
    data: {
      title: 'Learn TypeScript advanced types',
      description: 'Study and practice advanced TypeScript concepts',
      status: 'todo',
      priority: 'low',
      project_id: studyProject.id,
      estimated_hours: 4,
    },
  });
  console.log('   ✓ Learn TypeScript advanced types');

  // Create a test user
  console.log('\n👤 Creating test user...');
  await prisma.user.create({
    data: {
      username: 'testuser',
      password_hash: '$2b$10$examplehashthatislongenoughforsecurity', // This is a placeholder
      onboarding_completed: true,
    },
  });
  console.log('   ✓ Test user created (username: testuser)');

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });