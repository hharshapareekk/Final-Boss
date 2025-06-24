const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  rating: {
    type: Number,
    required: false,
    min: 0,
    max: 5
  },
  answers: {
    initial: [answerSchema],
    positive: [answerSchema],
    negative: [answerSchema]
  },
  message: {
    type: String
  },
  category: {
    type: String
  },
  source: {
    type: String
  },
  status: {
    type: String
  }
}, {
  timestamps: true
});

feedbackSchema.index({ email: 1 });
feedbackSchema.index({ sessionId: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ sessionId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema); 