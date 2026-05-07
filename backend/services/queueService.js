const { Queue } = require('bullmq');

const analyticsQueue = new Queue('analytics', {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const addClickJob = async (jobData) => {
  try {
    await analyticsQueue.add('click', jobData, {
      attempts: 3,         
      backoff: {
        type: 'exponential',
        delay: 1000,       
      },
    });
  } catch (error) {
    console.error('Queue error:', error.message);
  }
};

module.exports = { addClickJob };