const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  console.log('Attempting to fetch tasks...')
  
  try {
    const tasks = await prisma.task.findMany()
    console.log('Success! Found', tasks.length, 'tasks')
    console.log('First task:', tasks[0])
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
