import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from infra/.env
dotenv.config({ path: path.resolve(__dirname, '../../../infra/.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const urlParts = new URL(redisUrl);

const connection = {
  host: urlParts.hostname || 'localhost',
  port: Number(urlParts.port) || 6379,
  password: urlParts.password || undefined,
};

const QUEUE_NAMES = [
  'ai-site-generation',
  'ai-cv-analysis',
  'ai-cms-generation',
  'ai-agent-tasks',
];

async function checkQueues() {
  console.log(`\n🔍 Checking BullMQ Queues on Redis (${connection.host}:${connection.port})...\n`);

  for (const name of QUEUE_NAMES) {
    const queue = new Queue(name, { connection });
    try {
      const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      console.log(`📦 Queue: [ ${name} ]`);
      console.log(`   ⏳ Waiting : ${counts.waiting}`);
      console.log(`   ⚙️  Active   : ${counts.active}`);
      console.log(`   ✅ Completed: ${counts.completed}`);
      console.log(`   ❌ Failed   : ${counts.failed}`);
      console.log(`   🕒 Delayed  : ${counts.delayed}`);

      if (counts.waiting > 0 || counts.active > 0) {
        const activeJobs = await queue.getActive();
        for (const job of activeJobs) {
          console.log(`     👉 [Active Job ID: ${job.id}] Data:`, JSON.stringify(job.data).slice(0, 100) + '...');
        }
        const waitingJobs = await queue.getWaiting();
        for (const job of waitingJobs) {
          console.log(`     👉 [Waiting Job ID: ${job.id}] Data:`, JSON.stringify(job.data).slice(0, 100) + '...');
        }
      }
      console.log('--------------------------------------------------');
    } catch (err: any) {
      console.error(`❌ Error checking queue ${name}:`, err.message);
    } finally {
      await queue.close();
    }
  }

  process.exit(0);
}

checkQueues();
