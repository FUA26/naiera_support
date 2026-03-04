#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: 'apps/backoffice/.env.local' });

const prisma = new PrismaClient();

async function migrateNews() {
  console.log('Starting news migration...');

  // 1. Read existing news data
  const newsPath = path.join(process.cwd(), 'apps/landing/data/news/articles.json');

  if (!fs.existsSync(newsPath)) {
    console.error('News data file not found:', newsPath);
    process.exit(1);
  }

  const articlesData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  console.log(`Found ${articlesData.length} articles to migrate`);

  // 2. Extract unique categories
  const uniqueCategories = [...new Set(articlesData.map((a: any) => a.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  // 3. Create categories
  const categoryMap = new Map<string, string>();
  const colors = ['primary', 'blue', 'green', 'rose', 'orange', 'purple', 'cyan'];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const color = colors[index % colors.length];

    const category = await prisma.newsCategory.upsert({
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

  // 5. Migrate articles
  let migrated = 0;
  let skipped = 0;

  for (const article of articlesData) {
    const categoryId = categoryMap.get(article.category);

    if (!categoryId) {
      console.warn(`  - Skipping "${article.title}" - category not found: ${article.category}`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.news.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      console.warn(`  - Skipping "${article.title}" - already exists`);
      skipped++;
      continue;
    }

    try {
      await prisma.news.create({
        data: {
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          categoryId,
          featured: article.featured || false,
          author: article.author,
          readTime: article.readTime,
          tags: article.tags || [],
          status: 'PUBLISHED',
          publishedAt: new Date(article.date),
          createdById: adminUser.id,
          order: article.order || 0,
        },
      });

      migrated++;
      console.log(`  ✓ Migrated: "${article.title}"`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate "${article.title}":`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  - Migrated: ${migrated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total: ${articlesData.length}`);
}

migrateNews()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
