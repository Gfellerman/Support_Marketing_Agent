/**
 * Workflow Scheduler
 * 
 * Handles delayed workflow step execution using BullMQ.
 * Persists scheduled jobs to Redis so they survive server restarts.
 * Falls back to immediate execution if Redis is not available.
 */

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { executeWorkflowStep } from './engine';

// Workflow step job data
export interface WorkflowStepJobData {
  enrollmentId: number;
  workflowId: number;
  contactId: number;
  stepIndex: number;
  triggerData: Record<string, unknown>;
}

// Redis connection (optional)
let redisConnection: Redis | null = null;
let schedulerEnabled = false;

try {
  if (process.env.REDIS_URL) {
    redisConnection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    schedulerEnabled = true;
    console.log('[WorkflowScheduler] Redis configured, workflow scheduler enabled');
  } else {
    console.log('[WorkflowScheduler] Redis not configured, workflow delays will execute immediately');
  }
} catch (error) {
  console.warn('[WorkflowScheduler] Redis connection failed, workflow scheduler disabled:', error);
}

// Workflow step queue
export const workflowQueue = schedulerEnabled && redisConnection ? new Queue('workflow-steps', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 second delay
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
    },
  },
}) : null;

// Workflow step worker
const workflowWorker = schedulerEnabled && redisConnection ? new Worker<WorkflowStepJobData>(
  'workflow-steps',
  async (job: Job<WorkflowStepJobData>) => {
    const { enrollmentId, workflowId, contactId, stepIndex, triggerData } = job.data;
    
    console.log(`[WorkflowScheduler] Processing workflow step job ${job.id}`);
    
    try {
      await executeWorkflowStep({
        enrollmentId,
        workflowId,
        contactId,
        stepIndex,
        triggerData,
      });
      
      return { success: true, enrollmentId, stepIndex };
    } catch (error) {
      console.error(`[WorkflowScheduler] Error processing workflow step:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 workflow steps concurrently
  }
) : null;

// Worker event handlers
if (workflowWorker) {
  workflowWorker.on('completed', (job) => {
    console.log(`[WorkflowScheduler] Job ${job.id} completed:`, job.returnvalue);
  });

  workflowWorker.on('failed', (job, err) => {
    console.error(`[WorkflowScheduler] Job ${job?.id} failed:`, err.message);
  });

  workflowWorker.on('error', (err) => {
    console.error('[WorkflowScheduler] Worker error:', err);
  });
}

/**
 * Schedule a workflow step to execute after a delay
 */
export async function scheduleWorkflowStep(
  data: WorkflowStepJobData,
  delayMs: number
): Promise<Job<WorkflowStepJobData> | null> {
  if (!workflowQueue) {
    console.warn('[WorkflowScheduler] Queue not available, executing step immediately');
    // Execute immediately without delay
    await executeWorkflowStep(data);
    return null;
  }
  
  const job = await workflowQueue.add('execute-step', data, {
    delay: delayMs,
    priority: 2, // Lower priority than immediate steps
  });
  
  console.log(`[WorkflowScheduler] Scheduled step ${data.stepIndex} to execute in ${delayMs}ms`);
  
  return job;
}

/**
 * Schedule an immediate workflow step execution
 */
export async function scheduleImmediateStep(
  data: WorkflowStepJobData
): Promise<Job<WorkflowStepJobData> | null> {
  if (!workflowQueue) {
    // Execute immediately
    await executeWorkflowStep(data);
    return null;
  }
  
  return await workflowQueue.add('execute-step', data, {
    priority: 1, // High priority for immediate execution
  });
}

/**
 * Get scheduler statistics
 */
export async function getSchedulerStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  if (!workflowQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    workflowQueue.getWaitingCount(),
    workflowQueue.getActiveCount(),
    workflowQueue.getCompletedCount(),
    workflowQueue.getFailedCount(),
    workflowQueue.getDelayedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

/**
 * Get recent workflow jobs
 */
export async function getRecentJobs(count: number = 20): Promise<Job[]> {
  if (!workflowQueue) return [];
  const jobs = await workflowQueue.getJobs(['completed', 'failed', 'active', 'waiting', 'delayed'], 0, count - 1);
  return jobs;
}

/**
 * Cancel a scheduled workflow step
 */
export async function cancelScheduledStep(jobId: string): Promise<void> {
  if (!workflowQueue) return;
  const job = await workflowQueue.getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`[WorkflowScheduler] Cancelled job ${jobId}`);
  }
}

/**
 * Pause the scheduler
 */
export async function pauseScheduler(): Promise<void> {
  if (workflowQueue) await workflowQueue.pause();
}

/**
 * Resume the scheduler
 */
export async function resumeScheduler(): Promise<void> {
  if (workflowQueue) await workflowQueue.resume();
}

/**
 * Clean old jobs
 */
export async function cleanScheduler(): Promise<void> {
  if (!workflowQueue) return;
  await workflowQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // Clean completed jobs older than 24h
  await workflowQueue.clean(7 * 24 * 3600 * 1000, 5000, 'failed'); // Clean failed jobs older than 7 days
}

/**
 * Shutdown the scheduler gracefully
 */
export async function shutdownScheduler(): Promise<void> {
  if (workflowWorker) await workflowWorker.close();
  if (workflowQueue) await workflowQueue.close();
  if (redisConnection) await redisConnection.quit();
}

// Export scheduler status
export const isSchedulerEnabled = () => schedulerEnabled;
