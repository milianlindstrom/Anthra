const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  // Create a new PrismaClient with the test database
  const prisma = new PrismaClient({
    datasourceUrl: 'file:/app/prisma/test_original.db'
  });
  
  try {
    console.log('Testing ORIGINAL database connection...');
    
    // Test projects
    const projects = await prisma.project.findMany();
    console.log(`Projects found in original DB: ${projects.length}`);
    if (projects.length > 0) {
      projects.forEach(p => console.log(`- Project: ${p.name} (${p.id})`));
    }
    
    // Test tasks
    const tasks = await prisma.task.findMany();
    console.log(`Tasks found in original DB: ${tasks.length}`);
    
    // Test users
    const users = await prisma.user.findMany();
    console.log(`Users found in original DB: ${users.length}`);
    
    if (projects.length === 0 && tasks.length === 0 && users.length === 0) {
      console.log('ORIGINAL DATABASE IS ALSO EMPTY!');
    } else {
      console.log('Original database has data!');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();