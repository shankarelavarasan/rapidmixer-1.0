/**
 * Service for handling background processing queues
 */
import Queue from 'bull';
import { processFolderStructure } from './folderService.js';
import { processFolderStructure as processWithGemini } from './geminiService.js';
import { getGeminiModel } from './geminiService.js';
import { saveResponseOutput } from '../utils/outputUtils.js';

// Create processing queues
const folderQueue = new Queue('folder-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Add a folder processing job to the queue
 * @param {Object} data - Job data
 * @param {Object} data.folderStructure - Folder structure to process
 * @param {string} data.prompt - User prompt
 * @param {string} data.templateText - Template text (if any)
 * @param {Object} data.options - Processing options
 * @returns {Promise<Object>} Job object
 */
export const queueFolderProcessing = async data => {
  const job = await folderQueue.add('process-folder', data);
  return job;
};

// Process folder queue
folderQueue.process('process-folder', async job => {
  const { folderStructure, prompt, templateText, options } = job.data;
  const { outputFormat, processingMode, saveOutput, outputDestination } =
    options || {};

  try {
    // Update job progress
    job.progress(10);

    // Process the folder structure to extract text from all files
    const processedFolderStructure =
      await processFolderStructure(folderStructure);
    job.progress(40);

    // Combine prompt with template if provided
    let combinedPrompt = prompt;
    if (templateText) {
      combinedPrompt = `Use this template: ${templateText}. ${combinedPrompt}`;
    }

    // Initialize Gemini model
    const model = getGeminiModel(process.env.GEMINI_API_KEY);
    job.progress(50);

    // Process the folder with Gemini
    const result = await processWithGemini(
      model,
      combinedPrompt,
      processedFolderStructure,
      {
        outputFormat,
        processingMode,
      }
    );
    job.progress(80);

    // Save output if requested
    if (saveOutput && outputDestination) {
      if (result.combined) {
        // Save combined result
        await saveResponseOutput(
          [{ response: result.response, outputFormat }],
          outputDestination,
          outputFormat
        );
      } else {
        // Save individual results
        const flatResponses = [];
        for (const folderResponses of Object.values(result.responses)) {
          flatResponses.push(...folderResponses);
        }
        await saveResponseOutput(
          flatResponses,
          outputDestination,
          outputFormat
        );
      }
    }

    job.progress(100);
    return result;
  } catch (error) {
    console.error('Error processing folder in queue:', error);
    throw error;
  }
});

// Event handlers for the folder queue
folderQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

folderQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

folderQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

/**
 * Get the status of a job
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job status
 */
export const getJobStatus = async jobId => {
  const job = await folderQueue.getJob(jobId);

  if (!job) {
    return { status: 'not-found' };
  }

  const state = await job.getState();
  const progress = job._progress;
  const result = job.returnvalue;
  const error = job.failedReason;

  return {
    id: job.id,
    status: state,
    progress,
    result,
    error,
  };
};
