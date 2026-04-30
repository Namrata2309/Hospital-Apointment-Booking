const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to the patient making the booking
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor', // Links to the specific doctor's profile
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g., "10:00 AM"
    },
    reasonForVisit: {
      type: String, // Allows the patient to write symptoms beforehand
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Pending', // Real-world systems usually require confirmation
    },
    notes: {
      type: String, // Space for the doctor to write a quick note after the visit
    },
    reportingTime: {
      type: Date, // Time when the patient reported/arrived for the appointment
      default: null,
    }
  },
  { timestamps: true }
);

// Real-world safeguard: Prevent double booking at the database level
// This index ensures a specific doctor cannot have two appointments at the exact same date and time.
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);