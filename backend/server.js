const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { redirectUrl } = require('./controllers/urlController');
const { generalLimiter, authLimiter, createUrlLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/keys', apiKeyRoutes);

app.get('/:shortCode', redirectUrl);
app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener API is running' });
});

// Error handlers should be last
app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

const startServer = async () => {
  const PORT = process.env.PORT || 5001;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });

  // Connect to DB and Redis in the background
  connectDB().then(() => console.log('✅ MongoDB connected.')).catch(err => console.error('❌ MongoDB fail:', err));
  connectRedis().then(() => console.log('✅ Redis connected.')).catch(err => console.error('❌ Redis fail:', err));
};



startServer();