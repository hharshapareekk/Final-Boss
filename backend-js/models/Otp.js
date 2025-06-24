const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m', // OTP expires in 10 minutes
  },
});

module.exports = mongoose.model('Otp', OtpSchema); 