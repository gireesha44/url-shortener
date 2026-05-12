const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const email = `test_${Date.now()}@example.com`;
    const user = await User.create({
      name: 'Test User',
      email: email,
      password: 'password123'
    });
    
    console.log('User created:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

test();
