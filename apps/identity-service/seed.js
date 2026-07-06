process.env.DATABASE_URL = 'postgresql://postgres.kptjzqtrpshlaeimbbtv:GZxY9K2pLmQ8vRt2026@aws-1-us-west-2.pooler.supabase.com:5432/postgres?schema=identity';
require('dotenv').config();
const { PrismaClient } = require('@prisma/client-identity');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');
  const passwordHash = await bcrypt.hash('admin@genzite.com', 10);
  
  // Upsert the Admin role first
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System Administrator',
      isSystem: true,
    },
  });

  // Upsert the user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@genzite.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'admin@genzite.com',
      passwordHash,
      name: 'Admin Genzite',
      isActive: true,
    },
  });

  // Check if role is assigned
  const userRole = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: adminRole.id }
  });

  if (!userRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      }
    });
  }

  console.log('Admin user seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
