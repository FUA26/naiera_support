#!/bin/bash
set -e

echo "🗄️  Bandanaiera Backoffice - Database Setup"
echo "============================================="
echo ""

# Load environment variables
if [ -f "apps/backoffice/.env.local" ]; then
  source <(grep -E '^DATABASE_URL|^NEXTAUTH' apps/backoffice/.env.local)
else
  echo "❌ .env.local not found. Please copy .env.example to .env.local and configure it."
  exit 1
fi

# Extract DATABASE_URL from .env.local
DATABASE_URL=$(grep '^DATABASE_URL=' apps/backoffice/.env.local | cut -d'"' -f2)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env.local"
  exit 1
fi

echo "📊 Database URL: ${DATABASE_URL:0:50}..."
echo ""

# Function to run seed scripts
run_seed() {
  local name=$1
  local file=$2
  
  echo "🌱 Seeding $name..."
  DATABASE_URL="$DATABASE_URL" npx tsx "apps/backoffice/$file" 2>&1 | tail -5
  echo ""
}

# Run migrations
echo "🔄 Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
echo ""

# Run seeds
run_seed "Permissions" "prisma/seed-permissions.ts"
run_seed "Roles" "prisma/seed-roles.ts"
run_seed "System Settings" "prisma/seed-system-settings.ts"
run_seed "Admin User" "prisma/seed-admin.ts"

echo "✅ Database setup completed!"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "🌐 Access the application at: http://localhost:3001/login"
