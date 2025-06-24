const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  name: String,
  description: String,
  date: String,
  feedbackSubmitted: Boolean
});

const UserSchema = new Schema({
  name: String,
  imageId: String, // This will store the GridFS file ID
  sessions: [SessionSchema]
});

module.exports = mongoose.model('User', UserSchema);