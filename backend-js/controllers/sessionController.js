const Session = require('../models/Session');
const nodemailer = require('nodemailer');
const Feedback = require('../models/Feedback');

// --- Nodemailer Transport Setup ---
// IMPORTANT: Replace with your actual email service credentials or use environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'yahoo'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (to be implemented)
const createSession = async (req, res) => {
    try {
        const { name, description, date, questions, attendees } = req.body;
        // Filter out questions with missing or empty text fields
        const cleanQuestions = {};
        if (questions) {
            for (const key of ['initial', 'positive', 'negative']) {
                if (Array.isArray(questions[key])) {
                    cleanQuestions[key] = questions[key].filter(q => q && typeof q.text === 'string' && q.text.trim() !== '');
                } else {
                    cleanQuestions[key] = [];
                }
            }
        }
        const newSession = new Session({
            name,
            description,
            date,
            questions: cleanQuestions,
            attendees,
        });
        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (error) {
        console.error("Failed to create session:", error);
        res.status(500).json({ message: 'Failed to create session' });
    }
};

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Public
const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get all sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
// @access  Public
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload a photo for an attendee
// @route   POST /api/sessions/:id/attendees/:email/photo
// @access  Private (to be implemented)
const uploadAttendeePhoto = async (req, res) => {
    const { id, email } = req.params;
    const { image } = req.body; // base64 image
    const { gfs } = req;

    if (!gfs) {
        return res.status(500).json({ message: 'GridFS not initialized' });
    }

    if (!image) {
        return res.status(400).json({ message: 'Image data is required' });
    }

    try {
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const attendee = session.attendees.find(a => a.email === email);
        if (!attendee) {
            return res.status(404).json({ message: 'Attendee not found in this session' });
        }

        // Decode base64 image and write to GridFS
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Invalid image format' });
        }
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${id}_${attendee.email}_${Date.now()}.jpg`;
        
        const writestream = gfs.openUploadStream(filename, {
            contentType: matches[1] || 'image/jpeg',
        });

        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(writestream);

        writestream.on('finish', async () => {
            attendee.faceImageId = writestream.id;
            attendee.isActual = true;
            await session.save();
            
            res.status(200).json({ 
                message: 'Photo uploaded successfully', 
                imageId: writestream.id
            });
        });

        writestream.on('error', (err) => {
            res.status(500).json({ message: 'Image upload failed while streaming to GridFS', details: err.message });
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Server error while uploading photo' });
    }
};

// @desc    Get questions for a specific session
// @route   GET /api/sessions/:id/questions
// @access  Public
const getSessionQuestions = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).select('questions');
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json({ questions: session.questions });
    } catch (error) {
        console.error('Error fetching session questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Public
const updateSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const updatedSession = await Session.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Session updated successfully',
            data: { session: updatedSession }
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Public
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Delete all feedback for this session
        await Feedback.deleteMany({ sessionId: session._id.toString() });

        await session.deleteOne();

        res.json({
            success: true,
            message: 'Session and related feedback deleted successfully'
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add attendees to session
// @route   POST /api/sessions/:id/attendees
// @access  Public
const addAttendees = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const { attendees } = req.body;
        session.attendees.push(...attendees);
        await session.save();

        res.json({
            success: true,
            message: 'Attendees added successfully',
            data: { session }
        });
    } catch (error) {
        console.error('Add attendees error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeAttendee = async (req, res) => {
    try {
        const { id, attendeeId } = req.params;

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const initialCount = session.attendees.length;
        session.attendees = session.attendees.filter(a => a._id.toString() !== attendeeId);
        if (session.attendees.length === initialCount) {
            return res.status(404).json({ message: 'Attendee not found' });
        }

        await session.save();

        res.json({
            success: true,
            message: 'Attendee removed successfully',
            data: { session }
        });

    } catch (error) {
        console.error('Remove attendee error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAttendeeStatus = async (req, res) => {
    try {
        const { id, attendeeId } = req.params;
        const { isActual } = req.body;

        if (typeof isActual !== 'boolean') {
            return res.status(400).json({ message: 'isActual must be a boolean' });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const attendee = session.attendees.id(attendeeId);
        if (!attendee) {
            return res.status(404).json({ message: 'Attendee not found' });
        }

        attendee.isActual = isActual;
        await session.save();

        res.json({
            success: true,
            message: 'Attendee status updated successfully',
            data: { attendee }
        });
    } catch (error) {
        console.error('Update attendee status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const notifyRegisteredAttendees = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Notify ALL registered attendees, regardless of attendance
        const attendeesToNotify = session.attendees.filter(
            (attendee) => attendee.isRegistered
        );

        if (attendeesToNotify.length === 0) {
            return res
                .status(400)
                .json({ message: 'No registered attendees to notify.' });
        }

        const portalLink =
            process.env.CLIENT_FRONTEND_URL || 'http://localhost:3000/feedback';

        const mailPromises = attendeesToNotify.map((attendee) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: attendee.email,
                subject: `Feedback Request for ${session.name}`,
                html: `
                    <p>Dear ${attendee.name},</p>
                    <p>Thank you for registering for the session: <strong>${session.name}</strong>.</p>
                    <p>We would love to get your feedback. Please use the link below to access the feedback portal:</p>
                    <a href="${portalLink}">Go to Feedback Portal</a>
                    <p>Thank you!</p>
                `,
            };
            return transporter.sendMail(mailOptions);
        });

        await Promise.all(mailPromises);

        res.json({
            success: true,
            message: `Successfully sent notification emails to ${attendeesToNotify.length} attendees.`,
        });
    } catch (error) {
        console.error('Notify attendees error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
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
}; 