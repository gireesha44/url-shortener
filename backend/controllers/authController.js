const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (userId) => {
  return jwt.sign(
    { userId },                        
    process.env.JWT_SECRET,             
    { expiresIn: '7d' }                  
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = createToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      webhookUrl: user.webhookUrl,
    },
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    
    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res);

  } catch (error) {
    next(error); 
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      webhookUrl: req.user.webhookUrl,
    },
  });
};

const updateWebhook = async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;

    if (webhookUrl && !webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook URL format. Must start with http:// or https://',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { webhookUrl: webhookUrl || '' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Webhook URL updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        webhookUrl: user.webhookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateWebhook };