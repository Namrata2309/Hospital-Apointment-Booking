const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor'); // <-- FIX: ADDED THIS IMPORT!
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// 1. GET: Fetch appointments for the logged-in doctor
// (Moved to the top to prevent route clashing)
// ==========================================
// GET: Fetch ALL appointments (Admin Only)
// ==========================================
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email') // Get Patient details
      .populate({ 
        path: 'doctorId', 
        populate: { path: 'userId', select: 'firstName lastName' } // Deep populate Doctor details
      })
      .sort({ appointmentDate: -1 }); // Sort newest first
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});
// 1. GET: Fetch appointments for the logged-in doctor
router.get('/my-schedule', protect, authorize('Doctor'), async (req, res) => {
  try {
    // Find the Doctor profile linked to this logged-in User ID
    const doctorProfile = await Doctor.findOne({ userId: req.user.userId });
    
    // THE FIX: If no linked profile exists, stop here and send a clean error
    if (!doctorProfile) {
      return res.status(404).json({ 
        message: 'Doctor profile missing. Please contact Admin to set up your profile.' 
      });
    }

    // Fetch all appointments matching that specific Doctor's ID
    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'firstName lastName') 
      .sort({ appointmentDate: 1 }); 
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 2. POST: Book a new appointment
router.post('/book', protect, authorize('Patient'), async (req, res) => {
  try {
    
    const { patientId, doctorId, appointmentDate, timeSlot, reasonForVisit } = req.body;

    
    // ADD THIS LINE:
    console.log("INCOMING BOOKING DATA:", { patientId, doctorId, appointmentDate, timeSlot });
    // EDGE CASE 1: Prevent past date bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for an accurate day comparison
    const requestedDate = new Date(appointmentDate);
    
    if (requestedDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

    // EDGE CASE 2 & 3: Verify Doctor exists, is available, and actually works that day
    const doctor = await Doctor.findById(doctorId); // <-- This is where it was crashing!
    if (!doctor || !doctor.isAvailable) {
      return res.status(400).json({ message: 'This doctor is currently unavailable.' });
    }

    // Find what day of the week the requested date is (e.g., "Monday")
    // Find what day of the week the requested date is (e.g., "Monday")
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log("1. Backend Day Calculated As:", dayOfWeek);
    console.log("2. Doctor's Full Schedule in DB:", JSON.stringify(doctor.availableSlots, null, 2));
    
    // Check if the doctor has an availability object for that specific day
    const daySchedule = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
    
    console.log("3. Matching Day Schedule Found:", daySchedule);
    console.log("4. Requested Time Slot:", timeSlot);

    if (!daySchedule || !daySchedule.timeSlots.includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot. The doctor does not consult at this time.' });
    }

    // EDGE CASE 4: The Cancelled Slot Trap
    const existingAppointment = await Appointment.findOne({ 
      doctorId, 
      appointmentDate, 
      timeSlot,
      status: { $ne: 'Cancelled' } 
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    // If it passes all edge case checks, save it!
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      reasonForVisit
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Race condition caught: Slot just taken.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. PUT: Update appointment status (For Doctors/Admins)
router.put('/:id', protect, authorize('Doctor', 'Admin'), async (req, res) => {
  try {
    const { status, notes, reportingTime } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, reportingTime },
      { new: true } 
    );

    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

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
    // Find all appointments linked to this user's ID
      const appointments = await Appointment.find({ patientId: req.user.userId })
      // Deep populate: Get the Doctor profile, AND the User profile linked to that Doctor
      .populate({ 
        path: 'doctorId', 
        populate: { path: 'userId', select: 'firstName lastName' } 
      })
      .sort({ appointmentDate: -1 }); // Sort by newest first
      
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
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // SECURITY CHECK: Ensure the patient actually owns this appointment
    if (appointment.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // You can only cancel an appointment if it hasn't happened yet
    if (appointment.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;