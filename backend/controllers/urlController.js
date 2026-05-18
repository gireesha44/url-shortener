const Url = require('../models/Url');
const { generateShortCode } = require('../utils/base62');
const { setCache, getCache } = require('../services/cacheService');
const { addClickJob } = require('../services/queueService');
const UAParser = require('ua-parser-js');
const bcrypt = require('bcryptjs');

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
    const { originalUrl, customCode, expiresAt, tags, password } = req.body;

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

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customCode: customCode || null,
      user: req.user._id,
      expiresAt: expiresAt || null,
      tags: tags || [],
      password: hashedPassword,
    });

    if (!password) {
      setCache(shortCode, { originalUrl, urlId: url._id }).catch(err => {
        console.error('Background cache sync failed:', err.message);
      });
    }

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

    const cacheData = await getCache(shortCode);

    if (cacheData) {
      logClick(req, shortCode, cacheData.urlId);
      return res.redirect(cacheData.originalUrl);
    }

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found or has been deactivated',
      });
    }

    if (url.password) {
      return res.redirect(`http://localhost:5173/unlock/${shortCode}`);
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This short URL has expired',
      });
    }

    await setCache(shortCode, { originalUrl: url.originalUrl, urlId: url._id });

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

const unlockUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found',
      });
    }

    if (!url.password) {
      return res.status(200).json({
        success: true,
        data: { originalUrl: url.originalUrl },
      });
    }

    const isMatch = await bcrypt.compare(password, url.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password for this route',
      });
    }

    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
    logClick(req, shortCode, url._id);

    res.status(200).json({
      success: true,
      data: { originalUrl: url.originalUrl },
    });

  } catch (error) {
    next(error);
  }
};

const bulkShortenUrl = async (req, res, next) => {
  try {
    const { urls, expiresAt, tags, password } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a non-empty array of URLs',
      });
    }

    if (urls.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Bulk shortening is limited to 100 URLs per request',
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const validUrls = urls.filter(url => isValidUrl(url));
    if (validUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'None of the provided URLs are valid',
      });
    }

    let shortCodes = [];
    let attempts = 0;
    
    while (shortCodes.length < validUrls.length && attempts < 10) {
      attempts++;
      const needed = validUrls.length - shortCodes.length;
      const batchCodes = [];
      for (let i = 0; i < needed; i++) {
        batchCodes.push(generateShortCode(6));
      }

      const existing = await Url.find({ shortCode: { $in: batchCodes } });
      const existingCodes = new Set(existing.map(u => u.shortCode));
      
      for (const code of batchCodes) {
        if (!existingCodes.has(code) && !shortCodes.includes(code)) {
          shortCodes.push(code);
        }
      }
    }

    if (shortCodes.length < validUrls.length) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique short codes',
      });
    }

    const documents = validUrls.map((originalUrl, index) => ({
      originalUrl,
      shortCode: shortCodes[index],
      user: req.user._id,
      expiresAt: expiresAt || null,
      tags: tags || [],
      password: hashedPassword,
    }));

    const createdUrls = await Url.insertMany(documents);

    if (!password) {
      createdUrls.forEach(url => {
        setCache(url.shortCode, { originalUrl: url.originalUrl, urlId: url._id }).catch(err => {
          console.error(err.message);
        });
      });
    }

    const responseData = createdUrls.map(url => ({
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
    }));

    res.status(201).json({
      success: true,
      data: responseData,
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
  unlockUrl,
  bulkShortenUrl,
};