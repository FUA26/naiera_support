import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!admin) {
    console.log('Admin user not found');
    return;
  }

  // Get a tag
  const tag = await prisma.taskTag.findFirst({
    where: { name: 'Feature' },
  });

  // Create a test task
  const task = await prisma.task.create({
    data: {
      title: 'Test Task from Script',
      description: 'This is a test task created directly in the database',
      status: 'TODO',
      priority: 'HIGH',
      createdById: admin.id,
      assigneeId: admin.id,
      tags: tag ? {
        create: {
          tagId: tag.id,
        },
      } : undefined,
    },
    include: {
      assignee: true,
      createdBy: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  console.log('Created task:', JSON.stringify(task, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
