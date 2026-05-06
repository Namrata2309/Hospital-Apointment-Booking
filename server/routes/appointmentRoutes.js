const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // <-- ADDED: Needed to fetch patient emails
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendNotification } = require('../utils/notifications'); // <-- ADDED: SendGrid Utility
const upload = require('../utils/upload');
const router = express.Router();

// ==========================================
// GET: Fetch ALL appointments (Admin Only)
// ==========================================
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email')
      .populate({ 
        path: 'doctorId', 
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ appointmentDate: -1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 1. GET: Fetch appointments for the logged-in doctor
router.get('/my-schedule', protect, authorize('Doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctorProfile) {
      return res.status(404).json({ 
        message: 'Doctor profile missing. Please contact Admin to set up your profile.' 
      });
    }

    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'firstName lastName') 
      .sort({ appointmentDate: 1 }); 
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 2. POST: Book a new appointment
router.post('/book', protect, authorize('Patient'), upload.single('document'), async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reasonForVisit } = req.body;
    
    // Multer places the Cloudinary URL inside req.file.path!
    const documentUrl = req.file ? req.file.path : null;

    // ... [Keep your existing Edge Cases & Date validation here] ...

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      documentUrl // <-- Save the Cloudinary URL to MongoDB
    });

    await newAppointment.save();

    res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. PUT: Update appointment status (For Doctors/Admins)
// 3. PUT: Update appointment status (For Doctors/Admins)
router.put('/:id', protect, authorize('Doctor', 'Admin'), async (req, res) => {
  try {
    // ADDED prescription and advice here
    const { status, notes, reportingTime, prescription, advice } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, reportingTime, prescription, advice }, // Added them here
      { new: true } 
    ).populate('patientId').populate({ path: 'doctorId', populate: { path: 'userId' } });

    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

    // ... [Keep your SendGrid Notification logic here] ...

    res.json({ message: 'Status updated', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3B. PUT: Update patient reporting time (Admin Only)
router.put('/:id/report-time', protect, authorize('Admin'), async (req, res) => {
  try {
    const { reportingTime } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { reportingTime: reportingTime ? new Date(reportingTime) : null },
      { new: true }
    );

    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

    res.json({ message: 'Reporting time updated', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET: Fetch appointments for the logged-in PATIENT
// ==========================================
router.get('/my-appointments', protect, authorize('Patient'), async (req, res) => {
  try {
      const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate({ 
        path: 'doctorId', 
        populate: { path: 'userId', select: 'firstName lastName' } 
      })
      .sort({ appointmentDate: -1 }); 
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ==========================================
// PUT: Cancel an appointment (Patient Only)
// ==========================================
router.put('/:id/cancel', protect, authorize('Patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({ path: 'doctorId', populate: { path: 'userId' } });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    // ==========================================
    // NOTIFICATION: Cancelled by Patient
    // ==========================================
    try {
      const patient = await User.findById(req.user.userId);
      const emailMsg = `You have successfully cancelled your appointment with Dr. ${appointment.doctorId.userId.lastName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot}.`;
      sendNotification(patient.email, 'Appointment Cancelled - SmartCare', emailMsg);
    } catch (notifErr) {
      console.error("Failed to send cancellation notification:", notifErr);
    }

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;