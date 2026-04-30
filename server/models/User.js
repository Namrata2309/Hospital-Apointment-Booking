const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], // Regex validation
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6, // Real-world security baseline
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Patient', 'Admin'], // Restricts values to these three
      default: 'Patient',
    },
  },
  { 
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

module.exports = mongoose.model('User', userSchema);