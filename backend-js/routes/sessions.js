const express = require('express');
const {
  getAllSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  addAttendees,
  removeAttendee,
  updateAttendeeStatus,
  notifyRegisteredAttendees,
  getSessionQuestions
} = require('../controllers/sessionController');

const router = express.Router();

// Session Routes
router.route('/')
    .post(createSession)
    .get(getAllSessions);

router.route('/:id')
    .get(getSession)
    .put(updateSession)
    .delete(deleteSession);

router.route('/:id/questions').get(getSessionQuestions);

// Attendee Routes
router.route('/:id/attendees').post(addAttendees);
router.route('/:id/attendees/:attendeeId')
    .delete(removeAttendee)
    .patch(updateAttendeeStatus);

// Notification Route
router.route('/:id/notify-attendees').post(notifyRegisteredAttendees);

module.exports = router; 