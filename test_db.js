const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test projects
    const projects = await prisma.project.findMany();
    console.log(`Projects found: ${projects.length}`);
    if (projects.length > 0) {
      projects.forEach(p => console.log(`- Project: ${p.name} (${p.id})`));
    }
    
    // Test tasks
    const tasks = await prisma.task.findMany();
    console.log(`Tasks found: ${tasks.length}`);
    if (tasks.length > 0) {
      tasks.slice(0, 3).forEach(t => console.log(`- Task: ${t.title} (${t.id})`));
    }
    
    // Test users
    const users = await prisma.user.findMany();
    console.log(`Users found: ${users.length}`);
    if (users.length > 0) {
      users.forEach(u => console.log(`- User: ${u.username} (${u.id})`));
    }
    
    console.log('Database test completed successfully!');
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();