import * as dotenv from 'dotenv';
dotenv.config({ path: '../../infra/.env' });

import { PrismaClient } from '../node_modules/@prisma/client-identity/index.js';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@genzite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  console.log(`Seeding Admin User: ${adminEmail}...`);

  // Ensure ADMIN role exists
  const role = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator', isSystem: true },
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      passwordHash,
      status: 'ACTIVE'
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'System Admin',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: role.id
        }
      }
    }
  });

  console.log(`✅ Admin user seeded successfully! Email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
