const express = require('express');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// ==========================================
// GET: Fetch all available doctors (For Patients Page)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // Find all doctors who are marked as available
    // .populate() pulls the firstName, lastName, and email from the linked User profile
    const doctors = await Doctor.find({ isAvailable: true })
      .populate('userId', 'firstName lastName email phone'); 
    
    // Check if any doctors exist
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found at this time.' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
});

// ==========================================
// POST: Bulk Register Doctors (Admin Only)
// ==========================================
router.post('/bulk-register',protect, authorize('Admin'), async (req, res) => {
  try {
    const doctorsList = req.body; // Expecting an array of objects from the frontend
    
    if (!Array.isArray(doctorsList) || doctorsList.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of doctor data.' });
    }

    const successfulUploads = [];
    const failedUploads = [];

    // The default password given to all bulk-uploaded doctors
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('Hospital@123', salt);

    // Loop through each doctor in the uploaded array
    for (const docData of doctorsList) {
      try {
        // 1. Check if a user with this email already exists
        const existingUser = await User.findOne({ email: docData.email });
        if (existingUser) {
          failedUploads.push({ email: docData.email, reason: 'Email already exists' });
          continue; // Skip to the next doctor instead of crashing
        }

        // 2. Create the User profile for authentication
        const newUser = new User({
          firstName: docData.firstName,
          lastName: docData.lastName,
          email: docData.email,
          password: defaultHashedPassword, // Using the default password
          phone: docData.phone,
          role: 'Doctor'
        });
        const savedUser = await newUser.save();

        // 3. Create the linked Doctor profile
        const newDoctor = new Doctor({
          userId: savedUser._id, // Link to the newly created user
          specialty: docData.specialty,
          experience: docData.experience,
          consultationFee: docData.consultationFee,
          availableSlots: docData.availableSlots || [] 
        });
        await newDoctor.save();

        successfulUploads.push({ email: docData.email, status: 'Registered' });

      } catch (innerError) {
        // Catch errors specific to this single doctor's data (like missing required fields)
        failedUploads.push({ email: docData.email, reason: innerError.message });
      }
    }

    // Return a summary report to the Admin
    res.status(200).json({
      message: 'Bulk registration process completed.',
      summary: {
        totalAttempted: doctorsList.length,
        successCount: successfulUploads.length,
        failedCount: failedUploads.length
      },
      successfulUploads,
      failedUploads
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during bulk upload', error: error.message });
  }
});

module.exports = router;