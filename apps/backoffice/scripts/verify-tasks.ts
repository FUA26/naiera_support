import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    select: { id: true, title: true, status: true },
    take: 10,
  });
  console.log('All tasks:', JSON.stringify(tasks, null, 2));

  const count = await prisma.task.count();
  console.log('Total tasks:', count);

  const byStatus = await prisma.task.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('By status:', JSON.stringify(byStatus, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
