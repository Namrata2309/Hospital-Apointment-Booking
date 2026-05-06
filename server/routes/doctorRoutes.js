const express = require('express');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// ==========================================
// GET: Fetch all available doctors (For Patients Page)
// ==========================================
// routes/doctorRoutes.js (or wherever your get doctors route is)

// ==========================================
// GET: Fetch all doctors with Search, Filter & Pagination
// ==========================================
router.get('/', async (req, res) => {
  try {
    // 1. Extract query parameters from the URL
    const { search, specialty, sort, page = 1, limit = 5 } = req.query;

    // Build the initial query object for the Doctor collection
    let doctorQuery = {};

    // 2. SEARCH BY NAME (The Two-Step Query)
    if (search) {
      // Step A: Find users whose first or last name matches the search term (case-insensitive)
      const matchedUsers = await User.find({
        role: 'Doctor',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id'); 

      // Extract just the IDs into an array
      const matchedUserIds = matchedUsers.map(user => user._id);

      // Step B: Tell the Doctor query to ONLY look for these specific User IDs
      doctorQuery.userId = { $in: matchedUserIds };
    }

    // 3. FILTER BY SPECIALTY
    if (specialty) {
      // Case-insensitive exact match
      doctorQuery.specialty = { $regex: new RegExp(`^${specialty}$`, 'i') };
    }

    // 4. SORTING
    let sortObj = {};
    if (sort === 'fee-asc') sortObj.consultationFee = 1;      // Low to High
    if (sort === 'fee-desc') sortObj.consultationFee = -1;    // High to Low
    else sortObj.createdAt = -1;                              // Default: Newest first

    // 5. PAGINATION MATH
    const skipCount = (parseInt(page) - 1) * parseInt(limit);

    // 6. EXECUTE THE FINAL QUERY
    const doctors = await Doctor.find(doctorQuery)
      .populate('userId', 'firstName lastName email')
      .sort(sortObj)
      .skip(skipCount)
      .limit(parseInt(limit));

    // Get the total count of documents that match this query for frontend math
    const totalDoctors = await Doctor.countDocuments(doctorQuery);

    res.json({
      doctors,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalDoctors / limit),
      totalDoctors
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
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