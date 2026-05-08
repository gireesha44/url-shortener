const { Queue } = require('bullmq');
require('dotenv').config();

let analyticsQueue = null;

const getQueue = () => {
  if (!analyticsQueue) {
    analyticsQueue = new Queue('analytics', {
      connection: {
        url: process.env.REDIS_URL,
        tls: {},
      },
    });

    analyticsQueue.on('error', (err) => {
      console.error('Queue connection error:', err.message);
    });
  }
  return analyticsQueue;
};

const addClickJob = async (jobData) => {
  try {
    const queue = getQueue();
    const job = await queue.add('click', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    console.log('Job added to queue:', job.id);
  } catch (error) {
    console.error('Queue error:', error.message);
  }
};

module.exports = { addClickJob };