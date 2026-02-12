import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('🔍 Verifying document system setup...\n');

  // Check if new tables exist by trying to query them
  const contextTypes = await prisma.contextType.count();
  console.log(`✅ ContextType table exists (${contextTypes} records)`);

  const artifacts = await prisma.artifact.count();
  console.log(`✅ Artifact table exists (${artifacts} records)`);

  const documents = await prisma.document.count();
  console.log(`✅ Document table exists (${documents} records)`);

  const contextFiles = await prisma.contextFile.count();
  console.log(`✅ ContextFile table exists (${contextFiles} records)`);

  const aiInteractions = await prisma.aIInteraction.count();
  console.log(`✅ AIInteraction table exists (${aiInteractions} records)`);

  const routingPatterns = await prisma.routingPattern.count();
  console.log(`✅ RoutingPattern table exists (${routingPatterns} records)`);

  console.log('\n✅ All document system tables are ready!');
  console.log('🚀 You can now use the document system at /documents');
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.message.includes('does not exist')) {
    console.log('\n⚠️  Some tables are missing. Run: npx prisma db push');
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
