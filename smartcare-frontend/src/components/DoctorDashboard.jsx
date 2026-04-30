import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const BASE_FONT = "'DM Sans', -apple-system, sans-serif";

const S = {
  page: {
    minHeight: '100vh',
    background: '#f0ede8',
    padding: '2rem',
    fontFamily: BASE_FONT,
    boxSizing: 'border-box',
  },
  inner: { maxWidth: '1040px', margin: '0 auto' },
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
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: {
    width: '32px', height: '32px', background: '#065f46',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brand: { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#0d1f3c', fontWeight: 'normal' },
  badge: {
    background: '#f0fdf4', color: '#15803d', fontSize: '11px',
    fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bbf7d0',
  },
  logoutBtn: {
    padding: '7px 16px', background: 'transparent', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px',
    cursor: 'pointer', fontFamily: BASE_FONT,
  },
  section: {
    background: '#fff', borderRadius: '12px',
    border: '0.5px solid #dde1e7', padding: '1.5rem',
  },
  sectionTitle: {
    fontFamily: 'Georgia, serif', fontSize: '18px', color: '#0d1f3c',
    fontWeight: 'normal', margin: '0 0 1.25rem',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    padding: '10px 12px', textAlign: 'left', fontSize: '11px',
    fontWeight: '500', color: '#888', textTransform: 'uppercase',
    letterSpacing: '0.5px', borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px', borderBottom: '1px solid #f5f5f5',
    color: '#1a1a2e', verticalAlign: 'top',
  },
  statusBadge: (status) => {
    const map = {
      Completed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      Pending:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
      Confirmed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      Cancelled: { bg: '#fff5f5', color: '#b91c1c', border: '#fca5a5' },
    };
    const t = map[status] || map.Pending;
    return {
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '500',
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
    };
  },
  avatarCircle: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#dbeafe', color: '#1e40af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '500', flexShrink: 0,
  },
  actionWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  notesInput: {
    width: '100%', padding: '7px 10px', border: '1px solid #dde1e7',
    borderRadius: '7px', fontSize: '13px', fontFamily: BASE_FONT,
    boxSizing: 'border-box', outline: 'none', color: '#1a1a2e',
  },
  completeBtn: {
    padding: '7px 14px', background: '#065f46', color: '#fff',
    border: 'none', borderRadius: '7px', fontSize: '12px',
    cursor: 'pointer', fontFamily: BASE_FONT, fontWeight: '500',
  },
  emptyNote: { color: '#aaa', fontSize: '14px', padding: '1.5rem 0', textAlign: 'center' },
};

const DoctorDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState('');

  const fetchMyAppointments = async () => {
    try {
      const response = await api.get('/appointments/my-schedule');
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  useEffect(() => { fetchMyAppointments(); }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus, notes });
      alert(`Appointment marked as ${newStatus}`);
      setNotes('');
      fetchMyAppointments();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const initials = (first = '', last = '') =>
    `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();

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
            <span style={S.badge}>Doctor</span>
          </div>
          <button style={S.logoutBtn} onClick={logout}>Sign out</button>
        </div>

        {/* Schedule */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>Your Schedule</h2>
          {appointments.length === 0 ? (
            <p style={S.emptyNote}>No appointments scheduled.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date & Time</th>
                  <th style={S.th}>Patient</th>
                  <th style={S.th}>Reason</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '500' }}>{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{appt.timeSlot}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={S.avatarCircle}>
                          {initials(appt.patientId.firstName, appt.patientId.lastName)}
                        </div>
                        <span>{appt.patientId.firstName} {appt.patientId.lastName}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: '#555', maxWidth: '180px' }}>
                      {appt.reasonForVisit || <span style={{ color: '#bbb' }}>N/A</span>}
                    </td>
                    <td style={S.td}>
                      <span style={S.statusBadge(appt.status)}>{appt.status}</span>
                    </td>
                    <td style={S.td}>
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') ? (
                        <div style={S.actionWrap}>
                          <input
                            type="text"
                            placeholder="Add notes..."
                            style={S.notesInput}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                          <button
                            style={S.completeBtn}
                            onClick={() => handleUpdateStatus(appt._id, 'Completed')}
                          >
                            Mark Completed
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#888' }}>{appt.notes}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;