const Analytics = require('../models/Analytics');
const Url = require('../models/Url');

const getUrlAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      shortCode,
      user: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    const clicks = await Analytics.find({ shortCode }).sort({ clickedAt: -1 });

    const deviceBreakdown = await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);

    const browserBreakdown = await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
    ]);

    const referrerBreakdown = await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const clicksOverTime = await Analytics.aggregate([
      { $match: { shortCode } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        totalClicks: url.clicks,
        deviceBreakdown,
        browserBreakdown,
        referrerBreakdown,
        clicksOverTime,
        recentClicks: clicks.slice(0, 10),
      },
    });

  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const urls = await Url.find({ user: req.user._id });
    const shortCodes = urls.map((u) => u.shortCode);

    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

    const deviceBreakdown = await Analytics.aggregate([
      { $match: { shortCode: { $in: shortCodes } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);

    const referrerBreakdown = await Analytics.aggregate([
      { $match: { shortCode: { $in: shortCodes } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const clicksOverTime = await Analytics.aggregate([
      { $match: { shortCode: { $in: shortCodes } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUrls: urls.length,
        totalClicks,
        deviceBreakdown,
        referrerBreakdown,
        clicksOverTime,
      },
    });

  } catch (error) {
    next(error);
  }
};

const getHourlyAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      shortCode,
      user: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    const hourlyClicks = await Analytics.aggregate([
      { $match: { shortCode } },
      {
        $group: {
          _id: { $hour: '$clickedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: hourlyClicks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUrlAnalytics, getDashboardStats, getHourlyAnalytics };