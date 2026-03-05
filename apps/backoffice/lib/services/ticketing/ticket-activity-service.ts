import { prisma } from "@/lib/prisma";
import { ActivityAction } from "@prisma/client";

interface AddActivityInput {
  ticketId: string;
  action: ActivityAction;
  userId?: string;
  changes?: any;
  metadata?: any;
}

export async function addTicketActivity(input: AddActivityInput) {
  return prisma.ticketActivity.create({
    data: {
      ticketId: input.ticketId,
      action: input.action,
      userId: input.userId,
      changes: input.changes,
      metadata: input.metadata,
    }
  });
}

export async function getTicketActivities(ticketId: string) {
  return prisma.ticketActivity.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });
}
