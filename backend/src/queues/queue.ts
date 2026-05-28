import { Queue, Worker } from 'bullmq';
import { generateQuestionPaper } from '../services/gemini.service';
import { Assignment } from '../models/assignment.model';
import { notifyClient } from '../sockets/socket';
import { redisConnection } from '../config/redis';

export const assignmentQueue = new Queue('assignment-queue', {
  connection: redisConnection,
});

// Worker
export function startWorker() {
  const worker = new Worker(
    'assignment-queue',
    async (job) => {
      const { assignmentId } = job.data;

      try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
          console.warn(`Job ${job.id} skipped: Assignment ${assignmentId} was deleted.`);
          return;
        }

        // Processing state
        assignment.status = 'processing';
        await assignment.save();

        notifyClient(assignmentId, {
          status: 'processing',
        });

        // Generating state
        assignment.status = 'generating';
        await assignment.save();

        notifyClient(assignmentId, {
          status: 'generating',
        });

        // AI generation
        const generatedPaper = await generateQuestionPaper(
          assignment.title,
          assignment.questionTypes,
          assignment.additionalInstructions || '',
          assignment.fileContent || undefined
        );

        // Formatting state
        assignment.status = 'formatting';
        await assignment.save();

        notifyClient(assignmentId, {
          status: 'formatting',
        });

        // Save result
        assignment.generatedPaper = generatedPaper;
        assignment.status = 'completed';

        await assignment.save();

        // Notify frontend
        notifyClient(assignmentId, {
          status: 'completed',
          data: assignment,
        });

        return generatedPaper;

      } catch (error: any) {
        console.error(
          `Error processing job ${job.id}:`,
          error
        );

        const attemptsMade = job.attemptsMade || 0;
        const maxAttempts = job.opts.attempts || 1;

        if (attemptsMade + 1 >= maxAttempts) {
          await Assignment.findByIdAndUpdate(assignmentId, {
            status: 'failed',
            error: error.message,
          });

          notifyClient(assignmentId, {
            status: 'failed',
            error: error.message,
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `Job ${job?.id} failed with error:`,
      err
    );
  });
}