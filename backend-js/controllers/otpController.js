const Otp = require('../models/Otp');
const Session = require('../models/Session');
const nodemailer = require('nodemailer');
const Feedback = require('../models/Feedback');

// --- Nodemailer Transport Setup ---
// IMPORTANT: Replace with your actual email service credentials or use environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'yahoo'
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS,   // Your email password or app-specific password
  },
});

// @desc    Generate and send OTP
// @route   POST /api/otp/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    console.log('OTP SEND REQ BODY:', req.body);
    const { email, session_id, sessionId } = req.body;
    const sid = sessionId || session_id;
    if (!email || !sid) {
      return res.status(400).json({ message: 'Email and sessionId are required' });
    }

    // Check if feedback already exists for this session and email
    const existing = await Feedback.findOne({ sessionId: sid, email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Feedback has already been submitted for this session.' });
    }

    // Check if the email is registered for the session
    const session = await Session.findById(sid);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    const attendee = session.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!attendee) {
      return res.status(400).json({ message: 'This email is not registered for this session.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await Otp.findOneAndUpdate(
      { email, sessionId: sid },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // --- Send Email ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Feedback Portal',
      text: `Your One-Time Password (OTP) is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, session_id, sessionId, otp } = req.body;
        const sid = sessionId || session_id;
        if (!email || !sid || !otp) {
            return res.status(400).json({ verified: false, error: 'Email, sessionId/session_id, and OTP are required.' });
        }

        // Find the OTP in the database
        const storedOtp = await Otp.findOne({
            email,
            sessionId: sid,
            otp,
        });

        if (!storedOtp) {
            return res.status(400).json({ verified: false, error: 'Invalid OTP or OTP has expired.' });
        }

        // Check if the user is an actual attendee
        const session = await Session.findById(sid);
        if (!session) {
            return res.status(404).json({ verified: false, error: 'Session not found.' });
        }

        const attendee = session.attendees.find(a => a.email === email);
        const is_actual_attendee = attendee ? attendee.isActual : false;

        // Optionally, delete the OTP after verification to prevent reuse
        await Otp.deleteOne({ _id: storedOtp._id });

        res.status(200).json({
            verified: true,
            is_actual_attendee,
            email // Pass back the email for the frontend
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ verified: false, error: 'Server error during OTP verification.' });
    }
};


module.exports = {
  sendOtp,
  verifyOtp,
}; 