const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const sessionRoutes = require('./routes/sessions');
const feedbackRoutes = require('./routes/feedback');
const otpRoutes = require('./routes/otp');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_FRONTEND_URL || 'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to database
connectDB();

// Define Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/otp', otpRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));