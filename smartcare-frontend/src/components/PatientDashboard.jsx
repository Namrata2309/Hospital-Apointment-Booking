import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const BASE = {
  fontFamily: "'DM Sans', -apple-system, sans-serif",
};

const S = {
  page: {
    ...BASE,
    minHeight: '100vh',
    background: '#f0ede8',
    padding: '2rem',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '1040px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '12px',
    border: '0.5px solid #dde1e7',
    padding: '14px 20px',
    marginBottom: '1.5rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoMark: {
    width: '32px',
    height: '32px',
    background: '#0d3b6e',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brand: {
    fontFamily: 'Georgia, serif',
    fontSize: '17px',
    color: '#0d1f3c',
    fontWeight: 'normal',
  },
  badge: {
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid #bfdbfe',
  },
  logoutBtn: {
    padding: '7px 16px',
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  section: {
    background: '#fff',
    borderRadius: '12px',
    border: '0.5px solid #dde1e7',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: '#0d1f3c',
    fontWeight: 'normal',
    margin: '0 0 1.25rem',
  },
  toast: (type) => ({
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '1rem',
    background: type === 'success' ? '#f0fdf4' : type === 'error' ? '#fff5f5' : '#eff6ff',
    color: type === 'success' ? '#15803d' : type === 'error' ? '#b91c1c' : '#1d4ed8',
    border: `1px solid ${type === 'success' ? '#bbf7d0' : type === 'error' ? '#fca5a5' : '#bfdbfe'}`,
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f5f5f5',
    color: '#1a1a2e',
    verticalAlign: 'middle',
  },
  statusBadge: (status) => {
    const map = {
      Cancelled: { bg: '#fff5f5', color: '#b91c1c', border: '#fca5a5' },
      Completed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      Confirmed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      Pending:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    };
    const t = map[status] || map.Pending;
    return {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      background: t.bg,
      color: t.color,
      border: `1px solid ${t.border}`,
    };
  },
  cancelBtn: {
    padding: '5px 12px',
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  doctorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  doctorCard: {
    border: '0.5px solid #dde1e7',
    borderRadius: '12px',
    padding: '16px',
    width: '240px',
    background: '#fafafa',
  },
  doctorName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#0d1f3c',
    margin: '0 0 6px',
  },
  doctorMeta: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 4px',
  },
  selectBtn: {
    width: '100%',
    padding: '9px',
    background: '#0d3b6e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  bookingModal: {
    background: '#f8f9ff',
    border: '1px solid #c7d2fe',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  bookingTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '17px',
    color: '#0d1f3c',
    fontWeight: 'normal',
    margin: '0 0 1.25rem',
  },
  formField: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
  },
  formInput: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #dde1e7',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a2e',
    boxSizing: 'border-box',
    background: '#fff',
    outline: 'none',
  },
  confirmBtn: {
    padding: '10px 20px',
    background: '#0d3b6e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginRight: '8px',
  },
  closeBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #dde1e7',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyNote: {
    color: '#aaa',
    fontSize: '14px',
    padding: '1.5rem 0',
    textAlign: 'center',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#3730a3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '500',
    flexShrink: 0,
  },
};

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Get today's date formatted as YYYY-MM-DD for the date picker minimum
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayDateString();

  // All hospital time slots
  const availableSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

  // Helper to determine if a specific slot is in the past (only relevant if they selected today's date)
  const isSlotDisabled = (slotString) => {
    if (!appointmentDate) return false;
    
    // If they picked a date in the future, all slots are open
    if (appointmentDate !== todayStr) return false;

    // Convert "09:00 AM" into 24-hour military time for comparison
    const [time, period] = slotString.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const now = new Date();
    const currentHour = now.getHours();

    // Disable if the slot hour is less than or equal to the current hour
    return currentHour >= hour;
  };

  const fetchData = async () => {
    try {
      const docsResponse = await api.get('/doctors');
      setDoctors(docsResponse.data);
      const apptsResponse = await api.get('/appointments/my-appointments');
      setMyAppointments(apptsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Booking...', type: 'info' });
    try {
      await api.post('/appointments/book', {
        patientId: user.userId,
        doctorId: selectedDoctor._id,
        appointmentDate,
        timeSlot,
        reasonForVisit,
      });
      setMessage({ text: 'Appointment successfully booked!', type: 'success' });
      setSelectedDoctor(null);
      setAppointmentDate('');
      setTimeSlot('');
      setReasonForVisit('');
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to book appointment', type: 'error' });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      alert('Appointment cancelled successfully.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const initials = (name = '') => name.slice(0, 2).toUpperCase();

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.logoMark}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3a3 3 0 110 6 3 3 0 010-6zm0 10.5a6 6 0 01-4.59-2.14C6.55 12.14 8.18 11.5 10 11.5s3.45.64 4.59 1.86A6 6 0 0110 15.5z" fill="#fff"/>
              </svg>
            </div>
            <span style={S.brand}>SmartCare</span>
            <span style={S.badge}>Patient</span>
          </div>
          <button style={S.logoutBtn} onClick={logout}>Sign out</button>
        </div>

        {/* Toast */}
        {message.text && <div style={S.toast(message.type)}>{message.text}</div>}

        {/* My Appointments */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>My Appointments</h2>
          {myAppointments.length === 0 ? (
            <p style={S.emptyNote}>No appointments yet. Book one below.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date & Time</th>
                  <th style={S.th}>Doctor</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myAppointments.map((appt) => (
                  <tr key={appt._id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '500' }}>{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{appt.timeSlot}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={S.avatarCircle}>{initials(appt.doctorId?.userId?.lastName || 'DR')}</div>
                        <span>Dr. {appt.doctorId?.userId?.lastName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={S.statusBadge(appt.status)}>{appt.status}</span>
                    </td>
                    <td style={S.td}>
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                        <button style={S.cancelBtn} onClick={() => handleCancelAppointment(appt._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Book a Doctor */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>Book a New Appointment</h2>
          <div style={S.doctorGrid}>
            {doctors.map((doc) => (
              <div key={doc._id} style={S.doctorCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ ...S.avatarCircle, background: '#d1fae5', color: '#065f46' }}>
                    {initials(doc.userId.lastName)}
                  </div>
                  <div>
                    <p style={S.doctorName}>Dr. {doc.userId.firstName} {doc.userId.lastName}</p>
                  </div>
                </div>
                <p style={S.doctorMeta}><strong>Specialty:</strong> {doc.specialty}</p>
                <p style={S.doctorMeta}><strong>Fee:</strong> ₹{doc.consultationFee}</p>
                <button
                  style={S.selectBtn}
                  onClick={() => { setSelectedDoctor(doc); setMessage({ text: '', type: '' }); }}
                >
                  Select for Booking
                </button>
              </div>
            ))}
          </div>

          {/* Booking Form */}
          {selectedDoctor && (
            <div style={S.bookingModal}>
              <h3 style={S.bookingTitle}>Book with Dr. {selectedDoctor.userId.lastName}</h3>
              <form onSubmit={handleBookAppointment}>
                <div style={S.formField}>
                  <label style={S.formLabel}>Date</label>
                  <input 
                    style={S.formInput} 
                    type="date" 
                    min={todayStr} 
                    value={appointmentDate} 
                    onChange={(e) => {
                      setAppointmentDate(e.target.value);
                      setTimeSlot(''); // Clear selected time if they switch dates
                    }} 
                    required 
                  />
                </div>
                <div style={S.formField}>
                  <label style={S.formLabel}>Time Slot</label>
                  <select 
                    style={S.formInput} 
                    value={timeSlot} 
                    onChange={(e) => setTimeSlot(e.target.value)} 
                    required
                  >
                    <option value="">Select a time...</option>
                    {availableSlots.map(slot => (
                      <option 
                        key={slot} 
                        value={slot} 
                        disabled={isSlotDisabled(slot)}
                        style={{ color: isSlotDisabled(slot) ? '#ccc' : '#000' }}
                      >
                        {slot} {isSlotDisabled(slot) ? '(Past)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={S.formField}>
                  <label style={S.formLabel}>Reason for Visit</label>
                  <textarea 
                    style={{ ...S.formInput, resize: 'vertical' }} 
                    rows="3" 
                    value={reasonForVisit} 
                    onChange={(e) => setReasonForVisit(e.target.value)} 
                  />
                </div>
                <div>
                  <button type="submit" style={S.confirmBtn}>Confirm Booking</button>
                  <button type="button" style={S.closeBtn} onClick={() => setSelectedDoctor(null)}>Close</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;