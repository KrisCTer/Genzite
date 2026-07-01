import { PrismaClient } from '@prisma/client-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load shared .env file
dotenv.config({ path: path.join(__dirname, '../../../infra/.env') });

if (!process.env.DATABASE_URL && process.env.SUPABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_URL;
  process.env.DIRECT_URL = process.env.SUPABASE_DIRECT_URL || process.env.SUPABASE_URL;
}

// Initialize Prisma Client to connect to the 'ai' schema
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching highly rated AI tasks for training...');

  // Fetch completed tasks that have good user ratings (rating = 1) and are not exported yet
  const tasks = await prisma.aiTaskLog.findMany({
    where: {
      status: 'COMPLETED',
      userRating: 1,
      isExported: false,
    },
  });

  if (tasks.length === 0) {
    console.log('No new training data found.');
    return;
  }

  const exportPath = path.join(process.cwd(), `training-data-${Date.now()}.jsonl`);
  const stream = fs.createWriteStream(exportPath);

  let exportCount = 0;

  for (const task of tasks) {
    // Only process if both input and output are available
    if (!task.input || !task.output) continue;

    try {
      const promptText = JSON.stringify(task.input);
      const completionText = typeof task.output === 'string' ? task.output : JSON.stringify(task.output);

      // Standard Fine-Tuning format for OpenAI/Gemini
      const jsonlLine = JSON.stringify({
        messages: [
          { role: 'user', content: promptText },
          { role: 'assistant', content: completionText },
        ],
      });

      stream.write(jsonlLine + '\n');
      exportCount++;
    } catch (err) {
      console.error(`Error processing task ${task.id}:`, err);
    }
  }

  stream.end();

  console.log(`Successfully exported ${exportCount} records to ${exportPath}`);

  // Mark as exported to prevent duplicates next time
  const ids = tasks.map((t) => t.id);
  await prisma.aiTaskLog.updateMany({
    where: { id: { in: ids } },
    data: { isExported: true },
  });

  console.log('Marked tasks as exported.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
