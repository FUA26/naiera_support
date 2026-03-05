import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      config: { welcomeMessage: "How can we help you today?" },
      isActive: true,
    },
    {
      type: "INTEGRATED_APP" as const,
      name: "In-App Support",
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
      await prisma.channel.create({
        data: {
          ...config,
          appId: app.id,
        },
      });
      console.log(`   ✅ Created channel: ${config.name} (${config.type})`);
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
