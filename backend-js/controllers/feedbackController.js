const Feedback = require('../models/Feedback');
const Session = require('../models/Session');

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private
const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    // Search by name, email, or message
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Execute query
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get session info
    const sessionIds = [...new Set(feedback.map(f => f.sessionId).filter(id => id))];
    if (sessionIds.length > 0) {
      const sessions = await Session.find({ '_id': { $in: sessionIds } }).select('name');
      const sessionMap = new Map(sessions.map(s => [s._id.toString(), s]));

      const populatedFeedback = feedback.map(f => ({
        ...f,
        user: { name: f.name, email: f.email }, // Construct user object
        session: f.sessionId ? sessionMap.get(f.sessionId.toString()) : { name: 'N/A' }
      }));
      
      const total = await Feedback.countDocuments(query);

      return res.json({
        success: true,
        data: populatedFeedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // Get total count
    const total = await Feedback.countDocuments(query);
    const feedbackWithUser = feedback.map(f => ({ ...f, user: { name: f.name, email: f.email } }));

    res.json({
      success: true,
      data: feedbackWithUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('adminResponse.respondedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const { sessionId, email, rating, answers } = req.body;

    // Validate required fields
    if (!sessionId || !email || !rating || !answers) {
      return res.status(400).json({ message: 'Please provide sessionId, email, rating, and answers' });
    }

    // Prevent duplicate feedback for the same session and email
    const existing = await Feedback.findOne({ sessionId, email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Feedback has already been submitted for this session.' });
    }

    // Ensure answers has initial, positive, negative arrays
    const cleanAnswers = {
      initial: Array.isArray(answers.initial) ? answers.initial : [],
      positive: Array.isArray(answers.positive) ? answers.positive : [],
      negative: Array.isArray(answers.negative) ? answers.negative : []
    };

    // Create feedback
    const feedback = await Feedback.create({
      sessionId,
      email,
      rating,
      answers: cleanAnswers
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { name, email, rating, message, category, status, priority, tags } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update fields
    if (name) feedback.name = name;
    if (email) feedback.email = email;
    if (rating) feedback.rating = rating;
    if (message) feedback.message = message;
    if (category) feedback.category = category;
    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;
    if (tags) feedback.tags = tags;

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback status
// @route   PATCH /api/feedback/:id/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.updateStatus(status, req.user.id);

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add admin response
// @route   POST /api/feedback/:id/response
// @access  Private
const addResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Response message is required' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.addAdminResponse(message, req.user.id);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMissedSessionFeedback = async (req, res) => {
  try {
    const { sessionId, email, reason, futureInterest } = req.body;

    if (!sessionId || !email || !reason || !futureInterest) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Prevent duplicate feedback for the same session and email
    const existing = await Feedback.findOne({ sessionId, email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Feedback has already been submitted for this session.' });
    }

    // Check if the email is registered for the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    const attendee = session.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!attendee) {
      return res.status(400).json({ message: 'This email is not registered for this session.' });
    }

    const feedback = await Feedback.create({
      email,
      message: `Reason for missing: ${reason} | Interest in future sessions: ${futureInterest}`,
      category: 'Missed Session',
      sessionId,
      source: 'web-missed-session',
      rating: 0, // Default rating for missed session
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Missed session feedback submitted successfully.',
      data: { feedback }
    });
  } catch (error) {
    console.error('Create missed session feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats/overview
// @access  Private
const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.getStats();
    const ratingDistribution = await Feedback.getRatingDistribution();
    const categoryDistribution = await Feedback.getCategoryDistribution();

    res.json({
      success: true,
      data: {
        stats,
        ratingDistribution,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk update status
// @route   PATCH /api/feedback/bulk/status
// @access  Private
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide feedback IDs' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await Feedback.updateMany(
      { _id: { $in: ids } },
      { 
        status,
        'adminResponse.respondedAt': new Date(),
        'adminResponse.respondedBy': req.user.id
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} feedback items updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
}; 