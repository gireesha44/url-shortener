const { Queue } = require('bullmq');

const analyticsQueue = new Queue('analytics', {
  connection: {
    url: process.env.REDIS_URL,
  },
});

analyticsQueue.on('error', (err) => {
  console.error('Queue connection error:', err.message);
});

const addClickJob = async (jobData) => {
  try {
    const job = await analyticsQueue.add('click', jobData, {
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