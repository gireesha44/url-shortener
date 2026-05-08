const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Worker: MongoDB Connected');
};

const processClick = async (job) => {
  const { shortCode, urlId, ipAddress, device, browser, referrer, clickedAt } = job.data;

  await Analytics.create({
    urlId,
    shortCode,
    ipAddress,
    device: ['desktop', 'mobile', 'tablet'].includes(device) ? device : 'unknown',
    browser: browser || 'unknown',
    referrer: referrer || 'direct',
    clickedAt: new Date(clickedAt),
    country: 'unknown',
  });

  if (urlId) {
    await Url.findByIdAndUpdate(urlId, { $inc: { clicks: 1 } });
  }

  console.log(`Processed click for: ${shortCode}`);
};

const startWorker = async () => {
  await connectDB();

  const worker = new Worker('analytics', processClick, {
    connection: {
      url: process.env.REDIS_URL,
      tls: {},
    },
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
  });

  console.log('Analytics worker is running...');
};

startWorker();