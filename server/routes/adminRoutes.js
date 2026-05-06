// routes/adminRoutes.js
const express = require('express');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// ==========================================
// GET: Admin Analytics Dashboard Data
// ==========================================
router.get('/analytics', protect, authorize('Admin'), async (req, res) => {
  try {
    // 1. Most Popular Specialties (Pie Chart Data)
    // We "lookup" the doctor for each appointment, then group by specialty
    const popularSpecialties = await Appointment.aggregate([
      { 
        $lookup: { 
          from: 'doctors',           // Target collection
          localField: 'doctorId',    // Field in Appointment
          foreignField: '_id',       // Field in Doctor
          as: 'doctorInfo'           // Array output name
        } 
      },
      { $unwind: '$doctorInfo' },    // Flatten the array
      { 
        $group: { 
          _id: '$doctorInfo.specialty', // Group by specialty
          count: { $sum: 1 }            // Add 1 for every match
        } 
      },
      { $sort: { count: -1 } },      // Sort highest to lowest
      { $project: { name: '$_id', value: '$count', _id: 0 } } // Rename keys for Recharts
    ]);

    // 2. Doctor Performance & Revenue (Bar Chart Data)
    // Calculate total appointments AND revenue generated per doctor
    const doctorPerformance = await Appointment.aggregate([
      { 
        $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctorInfo' } 
      },
      { $unwind: '$doctorInfo' },
      { 
        $lookup: { from: 'users', localField: 'doctorInfo.userId', foreignField: '_id', as: 'userInfo' } 
      },
      { $unwind: '$userInfo' },
      { 
        $group: { 
          _id: '$userInfo.lastName', // Group by Doctor's Last Name
          totalAppointments: { $sum: 1 },
          // Only sum revenue if the appointment was actually 'Completed'
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'Completed'] }, '$doctorInfo.consultationFee', 0] 
            } 
          }
        } 
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 7 }, // Only show top 7 doctors so the chart isn't crowded
      { $project: { name: { $concat: ["Dr. ", "$_id"] }, appointments: '$totalAppointments', revenue: '$revenue', _id: 0 } }
    ]);

    // 3. Quick KPI Stats
    const totalRevenueStats = doctorPerformance.reduce((acc, doc) => acc + doc.revenue, 0);
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

    res.json({
      popularSpecialties,
      doctorPerformance,
      kpis: {
        totalRevenue: totalRevenueStats,
        totalAppointments,
        completedAppointments
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: 'Server Error generating analytics' });
  }
});

module.exports = router;