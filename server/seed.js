// seed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import your models (adjust paths if your models folder is located elsewhere)
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcare');
    console.log('✅ MongoDB Connected!');

    // 2. Clear existing data to prevent duplicates
    console.log('🧹 Clearing old data...');
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();

    // 3. Create Users (1 Admin, 5 Doctors, 3 Patients)
    console.log('🌱 Planting Users...');
    
    // Create Admin
    const admin = await User.create({
      firstName: 'Admin', lastName: 'User', email: 'admin@smartcare.com', password: 'Password123!', phone: '1111111111', role: 'Admin'
    });

    // Create Patients
    const patient1 = await User.create({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'Password123!', phone: '2222222222', role: 'Patient' });
    const patient2 = await User.create({ firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'Password123!', phone: '3333333333', role: 'Patient' });
    const patient3 = await User.create({ firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', password: 'Password123!', phone: '4444444444', role: 'Patient' });
    const patients = [patient1._id, patient2._id, patient3._id];

    // Create Doctors
    const docUser1 = await User.create({ firstName: 'Sarah', lastName: 'Connor', email: 'sarah@smartcare.com', password: 'Password123!', phone: '5555555551', role: 'Doctor' });
    const docUser2 = await User.create({ firstName: 'Gregory', lastName: 'House', email: 'house@smartcare.com', password: 'Password123!', phone: '5555555552', role: 'Doctor' });
    const docUser3 = await User.create({ firstName: 'Stephen', lastName: 'Strange', email: 'strange@smartcare.com', password: 'Password123!', phone: '5555555553', role: 'Doctor' });
    const docUser4 = await User.create({ firstName: 'Michaela', lastName: 'Quinn', email: 'quinn@smartcare.com', password: 'Password123!', phone: '5555555554', role: 'Doctor' });
    const docUser5 = await User.create({ firstName: 'Derek', lastName: 'Shepherd', email: 'shepherd@smartcare.com', password: 'Password123!', phone: '5555555555', role: 'Doctor' });

    // 4. Create Doctor Profiles linked to the Users
    console.log('🩺 Setting up Doctor Profiles...');
    const defaultSlots = [
      { day: 'Monday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Tuesday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Wednesday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Thursday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Friday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] }
    ];

    const doctor1 = await Doctor.create({ userId: docUser1._id, specialty: 'Cardiology', consultationFee: 1500, isAvailable: true, availableSlots: defaultSlots });
    const doctor2 = await Doctor.create({ userId: docUser2._id, specialty: 'Neurology', consultationFee: 2000, isAvailable: true, availableSlots: defaultSlots });
    const doctor3 = await Doctor.create({ userId: docUser3._id, specialty: 'Orthopedics', consultationFee: 1200, isAvailable: true, availableSlots: defaultSlots });
    const doctor4 = await Doctor.create({ userId: docUser4._id, specialty: 'Pediatrics', consultationFee: 800, isAvailable: true, availableSlots: defaultSlots });
    const doctor5 = await Doctor.create({ userId: docUser5._id, specialty: 'Cardiology', consultationFee: 1800, isAvailable: true, availableSlots: defaultSlots });
    
    const doctors = [doctor1._id, doctor2._id, doctor3._id, doctor4._id, doctor5._id];

    // 5. Generate Random Appointments
    console.log('📅 Generating Appointments...');
    const times = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
    const statuses = ["Completed", "Completed", "Completed", "Pending", "Confirmed", "Cancelled"]; // Weighted towards Completed for revenue
    const reasons = ["Routine checkup", "Persistent headache", "Knee pain", "Fever and cough", "Follow up", "Heart palpitations"];

    const appointmentsToInsert = [];

    // Generate 30 appointments spread across the last 30 days
    for (let i = 0; i < 30; i++) {
      const randomDoctorId = doctors[Math.floor(Math.random() * doctors.length)];
      const randomPatientId = patients[Math.floor(Math.random() * patients.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
      
      // Generate a date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      appointmentsToInsert.push({
        patientId: randomPatientId,
        doctorId: randomDoctorId,
        appointmentDate: date.toISOString().split('T')[0],
        timeSlot: randomTime,
        status: randomStatus,
        reasonForVisit: randomReason,
        notes: randomStatus === 'Completed' ? 'Patient is doing well. Advised rest.' : '',
      });
    }

    await Appointment.insertMany(appointmentsToInsert);
    console.log(`✅ Successfully seeded 30 appointments!`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();