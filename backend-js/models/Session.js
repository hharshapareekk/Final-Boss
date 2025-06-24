const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['rating', 'text'], default: 'rating' },
}, { _id: false });

const attendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  isRegistered: { type: Boolean, default: true },
  isActual: { type: Boolean, default: false },
});

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
  questions: {
    initial: [questionSchema],
    positive: [questionSchema],
    negative: [questionSchema],
  },
  attendees: [attendeeSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assuming an admin user model
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema); 