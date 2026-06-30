 import { Queue } from 'bullmq';

async function checkQueue(queueName) {
  const queue = new Queue(queueName, {
    connection: {
      host: 'localhost',
      port: 6379
    }
  });

  const waitingCount = await queue.getWaitingCount();
  const activeCount = await queue.getActiveCount();
  const delayedCount = await queue.getDelayedCount();
  const failedCount = await queue.getFailedCount();
  const completedCount = await queue.getCompletedCount();

  console.log(`\n=== QUEUE: ${queueName} ===`);
  console.log(`Waiting: ${waitingCount}`);
  console.log(`Active (Processing): ${activeCount}`);
  console.log(`Delayed: ${delayedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Completed: ${completedCount}`);

  if (waitingCount > 0) {
    console.log('\n--- Waiting Jobs ---');
    const waitingJobs = await queue.getWaiting();
    waitingJobs.forEach(job => {
      console.log(`Job ID: ${job.id} | Name: ${job.name} | Data:`, job.data);
    });
  }

  if (activeCount > 0) {
    console.log('\n--- Active Jobs ---');
    const activeJobs = await queue.getActive();
    activeJobs.forEach(job => {
      console.log(`Job ID: ${job.id} | Name: ${job.name} | Data:`, job.data);
    });
  }
  
  if (failedCount > 0) {
    console.log('\n--- Recent Failed Jobs ---');
    const failedJobs = await queue.getFailed(0, 5); // get last 5
    failedJobs.forEach(job => {
      console.log(`Job ID: ${job.id} | Failed Reason: ${job.failedReason}`);
      if (job.stacktrace && job.stacktrace.length > 0) {
        console.log(`Stacktrace snippet: ${job.stacktrace[0].substring(0, 500)}`);
      }
    });
  }

  await queue.close();
}

async function main() {
  const queues = [
    'ai-cv-analysis',
    'ai-site-generation',
    'ai-cms-generation',
    'ai-agent-tasks',
    'ai-career-coaching',
    'ai-mock-interview'
  ];

  for (const q of queues) {
    await checkQueue(q);
  }
  
  console.log('\nDone.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
