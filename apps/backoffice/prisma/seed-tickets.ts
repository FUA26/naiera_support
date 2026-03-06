/**
 * Seed dummy ticket data for development
 */

import { prisma } from "../lib/prisma";

const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

const SUBJECTS = [
  "Tidak bisa login ke sistem",
  "Laporan bug di halaman dashboard",
  "Request fitur baru untuk laporan",
  "Gagal upload file",
  "Data tidak tampil dengan benar",
  "Error saat mencetak invoice",
  "Permintaan reset password",
  "Konfirmasi pembayaran belum muncul",
  "Integrasi API tidak berfungsi",
  "User tidak bisa mengubah profil",
] as const;

const MESSAGES = [
  "Saya sudah mencoba beberapa kali tapi masih belum bisa. Mohon bantuannya.",
  "Ini terjadi sejak update terakhir. Apa ada yang berubah?",
  "Butuh fitur ini untuk deadline minggu depan. Terima kasih.",
  "File yang saya upload ukurannya hanya 2MB tapi tetap gagal.",
  "Data yang seharusnya muncul tidak tampil sama sekali.",
  "Printer sudah benar tapi output kosong.",
  "Saya lupa password dan tidak bisa reset melalui email.",
  "Sudah 24 jam tapi status pembayaran masih pending.",
  "API return 500 error. Mohon cek segera.",
  "Tombol save tidak merespon saat diklik.",
] as const;

async function seedTickets() {
  console.log("🌱 Seeding dummy tickets...");

  // Get or create default app and channels
  let app = await prisma.app.findFirst({
    where: { slug: "support" },
  });

  if (!app) {
    app = await prisma.app.create({
      data: {
        name: "Customer Support",
        slug: "support",
        description: "Default support application",
        isActive: true,
      },
    });
    console.log(`✓ Created app: ${app.name}`);
  }

  // Get channels
  let channels = await prisma.channel.findMany({
    where: { appId: app.id },
  });

  if (channels.length === 0) {
    const webFormChannel = await prisma.channel.create({
      data: {
        appId: app.id,
        type: "WEB_FORM",
        name: "Website Form",
        isActive: true,
        config: {},
      },
    });

    const integratedChannel = await prisma.channel.create({
      data: {
        appId: app.id,
        type: "INTEGRATED_APP",
        name: "Main App",
        apiKey: "tk_dev123456789012345678901234567890",
        isActive: true,
        config: {},
      },
    });

    channels = [webFormChannel, integratedChannel];
    console.log(`✓ Created ${channels.length} channels`);
  }

  // Get an agent user for assignment
  const agent = await prisma.user.findFirst({
    where: {
      role: { name: "ADMIN" },
    },
  });

  if (!agent) {
    console.log("⚠ No agent user found. Skipping assignment.");
  }

  // Clear existing tickets
  const existingCount = await prisma.ticket.count();
  if (existingCount > 0) {
    console.log(`⚠ Found ${existingCount} existing tickets. Skipping seed.`);
    return;
  }

  // Create dummy tickets
  const tickets = [];
  const now = new Date();

  // Create tickets with different statuses
  for (let i = 0; i < 20; i++) {
    const status = TICKET_STATUSES[i % TICKET_STATUSES.length] as any;
    const priority = PRIORITIES[i % PRIORITIES.length] as any;
    const subject = SUBJECTS[i % SUBJECTS.length]!;
    const message = MESSAGES[i % MESSAGES.length]!;
    const channel = channels[i % channels.length];

    if (!channel) {
      console.error(`⚠ No channel found for index ${i}. Skipping.`);
      continue;
    }

    // Calculate dates based on status
    const createdAt = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // Spread over last 40 hours
    let resolvedAt: Date | undefined;
    let closedAt: Date | undefined;

    if (status === "RESOLVED" || status === "CLOSED") {
      resolvedAt = new Date(createdAt.getTime() + (1 * 60 * 60 * 1000)); // Resolved 1 hour after
    }
    if (status === "CLOSED") {
      closedAt = new Date(createdAt.getTime() + (2 * 60 * 60 * 1000)); // Closed 2 hours after
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `SUPP-${String(i + 1).padStart(5, '0')}`,
        appId: app.id,
        channelId: channel.id,
        subject,
        description: message,
        status,
        priority,
        // Mix of guest and user tickets
        guestEmail: `user${i}@example.com`,
        guestName: `User ${i + 1}`,
        // Some tickets have externalUserId (for integrated app)
        externalUserId: channel.type === "INTEGRATED_APP" ? `ext_user_${i}` : null,
        // Assign some tickets to agent
        ...(agent && i % 2 === 0 && {
          assignedTo: agent.id,
          assignedAt: new Date(createdAt.getTime() + (30 * 60 * 1000)),
        }),
        resolvedAt,
        closedAt,
        createdAt,
        updatedAt: new Date(now.getTime() - ((i - 1) * 60 * 60 * 1000)), // Some have recent updates
      },
    });

    tickets.push(ticket);

    // Add initial message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "CUSTOMER",
        message,
        createdAt,
      },
    });

    // Add agent replies for non-OPEN tickets
    if (status !== "OPEN") {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: "AGENT",
          ...(agent && { userId: agent.id }),
          message: `Terima kasih telah melaporkan. ${status === "RESOLVED" ? "Masalah sudah kami perbaiki." : status === "CLOSED" ? "Ticket ditutup." : "Sedang kami proses."}`,
          createdAt: new Date(createdAt.getTime() + (30 * 60 * 1000)),
        },
      });
    }

    // Add customer follow-up for some tickets
    if (i % 3 === 0) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: "CUSTOMER",
          message: "Update terbaru ya? Masih belum bisa juga.",
          createdAt: new Date(createdAt.getTime() + (90 * 60 * 1000)),
        },
      });
    }

    console.log(`  ✓ Created ticket: ${ticket.ticketNumber} (${status})`);
  }

  // Add activities
  for (const ticket of tickets) {
    await prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        action: "CREATED",
        ...(agent && { userId: agent.id }),
        createdAt: ticket.createdAt,
      },
    });

    if (ticket.assignedTo) {
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          action: "ASSIGNED",
          ...(agent && { userId: agent.id }),
          changes: agent ? { to: agent.name } : undefined,
          createdAt: ticket.assignedAt!,
        },
      });
    }

    if (ticket.status === "RESOLVED") {
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          action: "STATUS_CHANGED",
          ...(agent && { userId: agent.id }),
          changes: { from: "OPEN", to: "RESOLVED" },
          createdAt: ticket.resolvedAt!,
        },
      });
    }

    if (ticket.status === "CLOSED") {
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          action: "CLOSED",
          ...(agent && { userId: agent.id }),
          createdAt: ticket.closedAt!,
        },
      });
    }
  }

  console.log(`\n✅ Created ${tickets.length} dummy tickets`);
  console.log("   Status breakdown:");
  for (const status of TICKET_STATUSES) {
    const count = tickets.filter(t => t.status === status).length;
    console.log(`   - ${status}: ${count}`);
  }
}

seedTickets()
  .catch((error) => {
    console.error("Error seeding tickets:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
