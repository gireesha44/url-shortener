const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { redirectUrl } = require('./controllers/urlController');


dotenv.config();

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/:shortCode', redirectUrl);
app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};



startServer();