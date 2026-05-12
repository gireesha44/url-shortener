const Url = require('../models/Url');
const { generateShortCode } = require('../utils/base62');
const { setCache, getCache } = require('../services/cacheService');
const { addClickJob } = require('../services/queueService');
const UAParser = require('ua-parser-js');

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};
const { body, validationResult } = require('express-validator');

const validateUrl = [
  body('originalUrl')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL with http or https'),
  body('customCode')
    .optional()
    .isAlphanumeric()
    .isLength({ min: 3, max: 20 })
    .withMessage('Custom code must be 3-20 alphanumeric characters'),
];
const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customCode, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a URL',
      });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL',
      });
    }

    let shortCode;

    if (customCode) {
      const existing = await Url.findOne({ shortCode: customCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This custom code is already taken',
        });
      }
      shortCode = customCode;
    } else {
      let isUnique = false;
      while (!isUnique) {
        shortCode = generateShortCode(6);
        const existing = await Url.findOne({ shortCode });
        if (!existing) isUnique = true;
      }
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customCode: customCode || null,
      user: req.user._id,
      expiresAt: expiresAt || null,
    });

    await setCache(shortCode, originalUrl);

    res.status(201).json({
      success: true,
      data: {
        originalUrl,
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
        shortCode,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
};

const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const cachedUrl = await getCache(shortCode);

    if (cachedUrl) {
      logClick(req, shortCode, null);
      return res.redirect(cachedUrl);
    }

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found or has been deactivated',
      });
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This short URL has expired',
      });
    }

    await setCache(shortCode, url.originalUrl);

    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

    logClick(req, shortCode, url._id);

    return res.redirect(url.originalUrl);

  } catch (error) {
    next(error);
  }
};

const logClick = (req, shortCode, urlId) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();

  const deviceType = result.device.type || 'desktop';
  const browser = result.browser.name || 'unknown';
  const ipAddress =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'unknown';

  addClickJob({
    shortCode,
    urlId,
    ipAddress,
    device: deviceType,
    browser,
    referrer: req.headers.referer || 'direct',
    clickedAt: new Date(),
  });
};

const getMyUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ user: req.user._id })
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls,
    });
  } catch (error) {
    next(error);
  }
};


const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
      user: req.user._id, 
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    await Url.findByIdAndDelete(url._id);

    res.status(200).json({
      success: true,
      message: 'URL deleted successfully',
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  redirectUrl,
  getMyUrls,
  deleteUrl,
};