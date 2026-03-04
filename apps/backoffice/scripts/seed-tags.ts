import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tags = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#10b981' },
    { name: 'Documentation', color: '#f59e0b' },
    { name: 'Urgent', color: '#dc2626' },
  ];

  for (const tag of tags) {
    await prisma.taskTag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  console.log('Tags seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
