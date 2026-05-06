import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const BASE_FONT = "'DM Sans', -apple-system, sans-serif";

const S = {
  // ... (Keep all your existing styles exactly as they are)
  page: { minHeight: '100vh', background: '#f0ede8', padding: '2rem', fontFamily: BASE_FONT, boxSizing: 'border-box' },
  inner: { maxWidth: '1040px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px', border: '0.5px solid #dde1e7', padding: '14px 20px', marginBottom: '1.5rem' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '32px', height: '32px', background: '#065f46', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#0d1f3c', fontWeight: 'normal' },
  badge: { background: '#f0fdf4', color: '#15803d', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' },
  logoutBtn: { padding: '7px 16px', background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: BASE_FONT },
  section: { background: '#fff', borderRadius: '12px', border: '0.5px solid #dde1e7', padding: '1.5rem' },
  sectionTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#0d1f3c', fontWeight: 'normal', margin: '0 0 1.25rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #eee' },
  td: { padding: '12px', borderBottom: '1px solid #f5f5f5', color: '#1a1a2e', verticalAlign: 'top' },
  statusBadge: (status) => {
    const map = {
      Completed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      Pending:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
      Confirmed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      Cancelled: { bg: '#fff5f5', color: '#b91c1c', border: '#fca5a5' },
    };
    const t = map[status] || map.Pending;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: t.bg, color: t.color, border: `1px solid ${t.border}` };
  },
  avatarCircle: { width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', flexShrink: 0 },
  actionWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  completeBtn: { padding: '7px 14px', background: '#065f46', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: BASE_FONT, fontWeight: '500' },
  emptyNote: { color: '#aaa', fontSize: '14px', padding: '1.5rem 0', textAlign: 'center' },
  docLink: { display: 'inline-block', marginTop: '8px', padding: '5px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', textDecoration: 'none', fontSize: '11px', fontWeight: '600', fontFamily: BASE_FONT },
  
  // NEW STYLES FOR PRESCRIPTION MODAL
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
  inputRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  pInput: { flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' },
  addBtn: { padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginBottom: '15px' },
};

const DoctorDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  
  // Modal State
  const [activeAppt, setActiveAppt] = useState(null);
  const [prescription, setPrescription] = useState([{ medicine: '', dosage: '', duration: '' }]);
  const [advice, setAdvice] = useState('');

  const fetchMyAppointments = async () => {
    try {
      const response = await api.get('/appointments/my-schedule');
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  useEffect(() => { fetchMyAppointments(); }, []);

  // Handle Dynamic Prescription Rows
  const addRow = () => setPrescription([...prescription, { medicine: '', dosage: '', duration: '' }]);
  const handleRowChange = (index, field, value) => {
    const updated = [...prescription];
    updated[index][field] = value;
    setPrescription(updated);
  };

  const submitPrescriptionAndComplete = async () => {
    try {
      // Filter out empty medicine rows
      const cleanPrescription = prescription.filter(p => p.medicine.trim() !== '');

      await api.put(`/appointments/${activeAppt._id}`, { 
        status: 'Completed', 
        prescription: cleanPrescription,
        advice 
      });

      alert(`Prescription saved and appointment completed!`);
      setActiveAppt(null); // Close modal
      setPrescription([{ medicine: '', dosage: '', duration: '' }]); // Reset
      setAdvice('');
      fetchMyAppointments();
    } catch (err) {
      alert('Failed to save prescription');
    }
  };

  const initials = (first = '', last = '') => `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();

  return (
    <div style={S.page}>
      <div style={S.inner}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.logoMark}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3a3 3 0 110 6 3 3 0 010-6zm0 10.5a6 6 0 01-4.59-2.14C6.55 12.14 8.18 11.5 10 11.5s3.45.64 4.59 1.86A6 6 0 0110 15.5z" fill="#fff"/></svg>
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
                  <th style={S.th}>Reason & Docs</th>
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
                        <div style={S.avatarCircle}>{initials(appt.patientId.firstName, appt.patientId.lastName)}</div>
                        <span>{appt.patientId.firstName} {appt.patientId.lastName}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: '#555', maxWidth: '200px' }}>
                      <div>{appt.reasonForVisit || <span style={{ color: '#bbb' }}>N/A</span>}</div>
                      {appt.documentUrl && (
                        <a href={appt.documentUrl} target="_blank" rel="noopener noreferrer" style={S.docLink}>📄 View Document</a>
                      )}
                    </td>
                    <td style={S.td}><span style={S.statusBadge(appt.status)}>{appt.status}</span></td>
                    <td style={S.td}>
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') ? (
                        <button style={S.completeBtn} onClick={() => setActiveAppt(appt)}>
                          Write Prescription & Complete
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#888' }}>
                          {appt.prescription?.length > 0 ? 'Prescription Issued' : 'No Action Needed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PRESCRIPTION MODAL */}
      {activeAppt && (
        <div style={S.modalOverlay}>
          <div style={S.modalContent}>
            <h3 style={S.sectionTitle}>Write Prescription for {activeAppt.patientId.firstName}</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Medicines</label>
              {prescription.map((row, index) => (
                <div key={index} style={S.inputRow}>
                  <input style={S.pInput} placeholder="Medicine (e.g. Amoxicillin)" value={row.medicine} onChange={e => handleRowChange(index, 'medicine', e.target.value)} />
                  <input style={S.pInput} placeholder="Dosage (e.g. 1-0-1)" value={row.dosage} onChange={e => handleRowChange(index, 'dosage', e.target.value)} />
                  <input style={S.pInput} placeholder="Duration (e.g. 5 days)" value={row.duration} onChange={e => handleRowChange(index, 'duration', e.target.value)} />
                </div>
              ))}
              <button style={S.addBtn} onClick={addRow}>+ Add Another Medicine</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>General Advice / Notes</label>
              <textarea style={{ ...S.pInput, width: '100%', boxSizing: 'border-box' }} rows="3" placeholder="Drink plenty of water..." value={advice} onChange={e => setAdvice(e.target.value)}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...S.completeBtn, flex: 1 }} onClick={submitPrescriptionAndComplete}>Save & Mark Completed</button>
              <button style={{ padding: '7px 14px', border: '1px solid #ccc', background: '#fff', borderRadius: '7px', cursor: 'pointer' }} onClick={() => setActiveAppt(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;