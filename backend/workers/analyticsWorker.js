const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Worker: MongoDB Connected');
};

const processClick = async (job) => {
  let { shortCode, urlId, ipAddress, device, browser, referrer, clickedAt } = job.data;

  if (!urlId) {
    const url = await Url.findOne({ shortCode });
    if (url) urlId = url._id;
  }

  if (!urlId) {
    console.error(`Skipping click for ${shortCode}: URL ID not found`);
    return;
  }

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

  const url = await Url.findByIdAndUpdate(urlId, { $inc: { clicks: 1 } }).populate('user');

  if (url && url.user && url.user.webhookUrl) {
    try {
      await fetch(url.user.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'url.click',
          data: {
            shortCode,
            ipAddress,
            device: ['desktop', 'mobile', 'tablet'].includes(device) ? device : 'unknown',
            browser: browser || 'unknown',
            referrer: referrer || 'direct',
            clickedAt: new Date(clickedAt),
          }
        }),
      });
    } catch (webhookError) {
      console.error(`Webhook delivery failed: ${webhookError.message}`);
    }
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