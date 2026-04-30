const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links this profile to the authentication User model
      required: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    availableSlots: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        timeSlots: [String] // e.g., ["09:00 AM", "09:30 AM", "10:00 AM"]
      }
    ],
    isAvailable: {
      type: Boolean,
      default: true, // Allows admins to quickly hide a doctor if they go on leave
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);