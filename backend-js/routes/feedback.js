const express = require('express');
const {
  getAllFeedback,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  updateStatus,
  addResponse,
  getFeedbackStats,
  bulkUpdateStatus,
  createMissedSessionFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

// Routes
router.post('/missed-session', createMissedSessionFeedback);
router.get('/', getAllFeedback);
router.get('/stats/overview', getFeedbackStats);
router.get('/:id', getFeedback);
router.post('/', createFeedback);
router.put('/:id', updateFeedback);
router.patch('/:id/status', updateStatus);
router.patch('/bulk/status', bulkUpdateStatus);
router.post('/:id/response', addResponse);
router.delete('/:id', deleteFeedback);

module.exports = router; 