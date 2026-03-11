import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

/**
 * Generate a secure API key (64 hex characters = 32 bytes)
 */
function generateApiKey(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

async function seedTicketing() {
  console.log("🌱 Seeding ticketing module...\n");

  // Create or update the app
  const app = await prisma.app.upsert({
    where: { slug: "support" },
    update: {},
    create: {
      name: "Support",
      slug: "support",
      description: "General support tickets",
      isActive: true,
    },
  });

  console.log(`✅ App: ${app.slug} (${app.name})`);

  // Check existing channels
  const existingChannels = await prisma.channel.findMany({
    where: { appId: app.id },
  });

  // Create channels if they don't exist
  const channelConfigs = [
    {
      type: "WEB_FORM" as const,
      name: "Website Form",
      slug: "website-form",
      config: { welcomeMessage: "How can we help you today?" },
      isActive: true,
    },
    {
      type: "INTEGRATED_APP" as const,
      name: "In-App Support",
      slug: "inapp-support",
      apiKey: generateApiKey(),
      config: {},
      isActive: true,
    },
  ];

  let createdCount = 0;

  for (const config of channelConfigs) {
    const exists = existingChannels.some(
      (c) => c.type === config.type && c.name === config.name
    );

    if (!exists) {
      const created = await prisma.channel.create({
        data: {
          ...config,
          appId: app.id,
        },
      });
      console.log(`   ✅ Created channel: ${config.name} (${config.type})`);
      if (created.apiKey) {
        console.log(`      🔑 API Key: ${created.apiKey}`);
      }
      createdCount++;
    } else {
      console.log(`   ℹ️  Channel already exists: ${config.name} (${config.type})`);
    }
  }

  const allChannels = await prisma.channel.findMany({
    where: { appId: app.id },
  });

  console.log(`\n   Total channels: ${allChannels.length}\n`);
  console.log("🎉 Ticketing seeding completed!\n");
}

seedTicketing()
  .catch((e) => {
    console.error("❌ Error seeding ticketing:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
