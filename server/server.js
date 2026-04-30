const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from a .env file

const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON data from the frontend
app.use(cors());         // Prevents Cross-Origin Resource Sharing errors with React

// Database Connection


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));
// Route Middleware (We will create these files next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));