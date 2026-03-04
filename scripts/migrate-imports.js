const fs = require('fs');
const path = require('path');

const replacements = [
  // Shared UI components - match both "from @/components/ui/xxx" and "from '@/components/ui/xxx'"
  { from: /from ['"]@\/components\/ui\//g, to: 'from "@workspace/ui/' },
  // Handle case where entire import is from "@/components/ui"
  { from: /from ['"]@\/components\/ui['"]/g, to: 'from "@workspace/ui"' },

  // Hooks
  { from: /from ['"]@\/hooks\//g, to: 'from "@workspace/hooks/' },

  // Types
  { from: /from ['"]@\/types\//g, to: 'from "@workspace/types/' },
  { from: /from ['"]@\/types['"]/g, to: 'from "@workspace/types"' },
  { from: /import type ['"]@\/types['"]/g, to: 'import type "@workspace/types"' },

  // API (where applicable)
  { from: /from ['"]@\/lib\/api['"]/g, to: 'from "@workspace/api"' },
  { from: /from ['"]@\/lib\/api\//g, to: 'from "@workspace/api/' },

  // Utils
  { from: /from ['"]@\/lib\/utils['"]/g, to: 'from "@workspace/utils"' },
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() &&
!['node_modules', '.next', 'dist', '.turbo', '.git'].includes(file)
) {
      updatedCount += walkDir(filePath);
    } else if (file.match(/\.(ts|tsx)$/)) {
      if (migrateFile(filePath)) {
        updatedCount++;
      }
    }
  }

  return updatedCount;
}

// Migrate apps/backoffice
const backofficeDir = path.join(process.cwd(), 'apps', 'backoffice');
if (!fs.existsSync(backofficeDir)) {
  console.error(`❌ Directory not found: ${backofficeDir}`);
  process.exit(1);
}

console.log(`\n🚀 Starting import migration for ${backofficeDir}...\n`);
const updatedCount = walkDir(backofficeDir);
console.log(`\n✅ Migration complete! Updated ${updatedCount} files.\n`);
