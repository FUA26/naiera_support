#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: 'apps/backoffice/.env.local' });

const prisma = new PrismaClient();

async function migrateEvents() {
  console.log('Starting event migration...');

  // 1. Read existing event data
  const eventsPath = path.join(process.cwd(), 'apps/landing/data/events/agenda.json');

  if (!fs.existsSync(eventsPath)) {
    console.error('Event data file not found:', eventsPath);
    process.exit(1);
  }

  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  console.log(`Found ${eventsData.length} events to migrate`);

  // 2. Extract unique categories
  const uniqueCategories = [...new Set(eventsData.map((e: any) => e.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  // 3. Create categories
  const categoryMap = new Map<string, string>();
  const colors = ['primary', 'blue', 'green', 'rose', 'orange', 'purple', 'cyan'];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const color = colors[index % colors.length];

    const category = await prisma.eventCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        color,
        order: index,
      },
    });

    categoryMap.set(name, category.id);
    console.log(`  - Category: ${name} (${slug})`);
  }

  // 4. Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } },
  });

  if (!adminUser) {
    console.error('Admin user not found');
    process.exit(1);
  }

  // 5. Migrate events
  let migrated = 0;
  let skipped = 0;

  for (const event of eventsData) {
    const categoryId = categoryMap.get(event.category);

    if (!categoryId) {
      console.warn(`  - Skipping "${event.title}" - category not found: ${event.category}`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.event.findUnique({
      where: { slug: event.slug },
    });

    if (existing) {
      console.warn(`  - Skipping "${event.title}" - already exists`);
      skipped++;
      continue;
    }

    try {
      await prisma.event.create({
        data: {
          slug: event.slug,
          title: event.title,
          description: event.description,
          categoryId,
          date: new Date(event.date),
          time: event.time,
          location: event.location,
          type: event.type?.toUpperCase() || 'OFFLINE',
          organizer: event.organizer,
          registrationRequired: event.registrationRequired || false,
          registrationUrl: event.registrationUrl,
          maxAttendees: event.maxAttendees,
          featured: event.featured || false,
          status: 'PUBLISHED',
          createdById: adminUser.id,
          order: event.order || 0,
        },
      });

      migrated++;
      console.log(`  ✓ Migrated: "${event.title}"`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate "${event.title}":`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  - Migrated: ${migrated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total: ${eventsData.length}`);
}

migrateEvents()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
