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
  inner: { maxWidth: '1200px', margin: '0 auto' },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0d1f3c',
    borderRadius: '12px',
    padding: '16px 22px',
    marginBottom: '1.5rem',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: {
    width: '32px', height: '32px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brand: {
    fontFamily: 'Georgia, serif',
    fontSize: '17px', color: '#fff', fontWeight: 'normal',
  },
  adminBadge: {
    background: 'rgba(255,255,255,0.12)', color: '#c7d2fe',
    fontSize: '11px', fontWeight: '500', padding: '3px 10px',
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  emailText: { fontSize: '13px', color: 'rgba(255,255,255,0.55)' },
  logoutBtn: {
    padding: '7px 16px', background: 'transparent', color: '#fca5a5',
    border: '1px solid rgba(252,165,165,0.4)', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer', fontFamily: BASE_FONT,
  },

  // ── Two-column layout ────────────────────────────────────────────────
  twoCol: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  leftCol: { width: '300px', flexShrink: 0 },
  rightCol: { flex: 1, minWidth: 0 },

  // ── Panel / Card ─────────────────────────────────────────────────────
  panel: {
    background: '#fff', borderRadius: '12px',
    border: '0.5px solid #dde1e7', padding: '1.5rem',
    marginBottom: '1.25rem',
  },
  panelTitle: {
    fontFamily: 'Georgia, serif', fontSize: '16px',
    color: '#0d1f3c', fontWeight: 'normal', margin: '0 0 1rem',
  },

  // ── Upload form ───────────────────────────────────────────────────────
  textarea: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #dde1e7', borderRadius: '8px',
    fontSize: '13px', fontFamily: "'Courier New', monospace",
    color: '#1a1a2e', boxSizing: 'border-box',
    resize: 'vertical', background: '#fafafa', outline: 'none',
  },
  uploadBtn: {
    width: '100%', marginTop: '10px', padding: '11px',
    background: '#0d3b6e', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', fontFamily: BASE_FONT,
  },

  // ── Table ─────────────────────────────────────────────────────────────
  scrollBox: { maxHeight: '580px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 12px', textAlign: 'left',
    fontSize: '11px', fontWeight: '500', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #eee',
    position: 'sticky', top: 0, background: '#fff',
  },
  td: {
    padding: '11px 12px', borderBottom: '1px solid #f5f5f5',
    color: '#1a1a2e', verticalAlign: 'middle',
  },

  // ── Status badge ──────────────────────────────────────────────────────
  statusBadge: (status) => {
    const map = {
      Cancelled: { bg: '#fff5f5', color: '#b91c1c', border: '#fca5a5' },
      Completed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      Confirmed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      Pending:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    };
    const t = map[status] || map.Pending;
    return {
      display: 'inline-block', padding: '2px 9px',
      borderRadius: '20px', fontSize: '11px', fontWeight: '500',
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
    };
  },

  // ── Avatar ────────────────────────────────────────────────────────────
  avatar: (bg, color) => ({
    width: '30px', height: '30px', borderRadius: '50%',
    background: bg, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '500', flexShrink: 0,
  }),

  // ── Reporting time cell ───────────────────────────────────────────────
  setTimeLink: {
    fontSize: '12px', color: '#2563eb',
    cursor: 'pointer', textDecoration: 'underline',
    textDecorationStyle: 'dotted',
  },
  timeDisplay: {
    fontSize: '13px', fontWeight: '500', color: '#0d1f3c',
    cursor: 'pointer', borderBottom: '1px dashed #aaa', paddingBottom: '1px',
  },
  datetimeInput: {
    padding: '6px 8px', border: '1px solid #dde1e7',
    borderRadius: '7px', fontSize: '12px',
    fontFamily: BASE_FONT, outline: 'none',
    color: '#1a1a2e', background: '#fafafa',
    marginBottom: '6px', display: 'block', width: '100%',
    boxSizing: 'border-box',
  },
  saveBtn: {
    padding: '5px 12px', background: '#0d3b6e',
    color: '#fff', border: 'none', borderRadius: '6px',
    fontSize: '12px', cursor: 'pointer',
    fontFamily: BASE_FONT, marginRight: '6px',
  },
  cancelEditBtn: {
    padding: '5px 10px', background: 'transparent',
    color: '#888', border: '1px solid #dde1e7',
    borderRadius: '6px', fontSize: '12px',
    cursor: 'pointer', fontFamily: BASE_FONT,
  },
};

const initials = (a = '', b = '') =>
  `${a.slice(0, 1)}${b.slice(0, 1)}`.toUpperCase();

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [jsonInput, setJsonInput]         = useState('');
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [editingId, setEditingId]         = useState(null);
  const [editingTime, setEditingTime]     = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchAllAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllAppointments(); }, []);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      await api.post('/doctors/bulk-register', parsed);
      alert('Upload successful');
      setJsonInput('');
    } catch (err) {
      alert('Invalid JSON or upload failed');
    }
  };

  const handleEdit = (appt) => {
    setEditingId(appt._id);
    setEditingTime(
      appt.reportingTime
        ? new Date(appt.reportingTime).toISOString().slice(0, 16)
        : ''
    );
  };

  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      const res = await api.put(`/appointments/${editingId}/report-time`, {
        reportingTime: editingTime ? new Date(editingTime) : null,
      });
      setAppointments((prev) =>
        prev.map((a) => (a._id === editingId ? res.data.appointment : a))
      );
      setEditingId(null);
      setEditingTime('');
    } catch (err) {
      alert('Update failed');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => { setEditingId(null); setEditingTime(''); };

  // Stats
  const totalAppts     = appointments.length;
  const completedAppts = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledAppts = appointments.filter((a) => a.status === 'Cancelled').length;
  const pendingAppts   = appointments.filter(
    (a) => a.status === 'Pending' || a.status === 'Confirmed'
  ).length;

  const stats = [
    { label: 'Total',     value: totalAppts,     bg: '#fff',    numColor: '#0d3b6e', border: '#dde1e7' },
    { label: 'Completed', value: completedAppts, bg: '#f0fdf4', numColor: '#15803d', border: '#bbf7d0' },
    { label: 'Upcoming',  value: pendingAppts,   bg: '#fffbeb', numColor: '#92400e', border: '#fde68a' },
    { label: 'Cancelled', value: cancelledAppts, bg: '#fff5f5', numColor: '#b91c1c', border: '#fca5a5' },
  ];

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.logoMark}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3a3 3 0 110 6 3 3 0 010-6zm0 10.5a6 6 0 01-4.59-2.14C6.55 12.14 8.18 11.5 10 11.5s3.45.64 4.59 1.86A6 6 0 0110 15.5z"
                  fill="#fff"
                />
              </svg>
            </div>
            <span style={S.brand}>SmartCare</span>
            <span style={S.adminBadge}>Admin</span>
          </div>
          <div style={S.headerRight}>
            <span style={S.emailText}>{user?.email}</span>
            <button style={S.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '12px', border: `1px solid ${s.border}`, padding: '16px 20px' }}>
              <p style={{ fontSize: '28px', fontWeight: '500', color: s.numColor, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div style={S.twoCol}>

          {/* Left: Bulk Upload */}
          <div style={S.leftCol}>
            <div style={S.panel}>
              <h3 style={S.panelTitle}>Bulk Register Doctors</h3>
              <form onSubmit={handleBulkUpload}>
                <textarea
                  rows="9"
                  style={S.textarea}
                  placeholder={'[\n  {\n    "firstName": "Alice",\n    ...\n  }\n]'}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  style={S.uploadBtn}
                  onMouseEnter={(e) => (e.target.style.background = '#0a2d56')}
                  onMouseLeave={(e) => (e.target.style.background = '#0d3b6e')}
                >
                  Run Bulk Upload
                </button>
              </form>
            </div>
          </div>

          {/* Right: Master Appointment Log */}
          <div style={S.rightCol}>
            <div style={S.panel}>
              <h3 style={S.panelTitle}>Master Appointment Log</h3>

              {loading ? (
                <p style={{ color: '#bbb', fontSize: '14px', padding: '2rem', textAlign: 'center' }}>
                  Loading system data…
                </p>
              ) : (
                <div style={S.scrollBox}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Date & Time</th>
                        <th style={S.th}>Patient</th>
                        <th style={S.th}>Doctor</th>
                        <th style={S.th}>Status</th>
                        <th style={S.th}>Reporting Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>

                          {/* Date */}
                          <td style={S.td}>
                            <div style={{ fontWeight: '500' }}>
                              {new Date(appt.appointmentDate).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                              {appt.timeSlot}
                            </div>
                          </td>

                          {/* Patient */}
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={S.avatar('#dbeafe', '#1e40af')}>
                                {initials(appt.patientId?.firstName, appt.patientId?.lastName)}
                              </div>
                              <div>
                                <div>{appt.patientId?.firstName} {appt.patientId?.lastName}</div>
                                <div style={{ fontSize: '11px', color: '#aaa' }}>{appt.patientId?.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Doctor */}
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={S.avatar('#d1fae5', '#065f46')}>
                                {initials(appt.doctorId?.userId?.firstName, appt.doctorId?.userId?.lastName)}
                              </div>
                              <span>
                                Dr. {appt.doctorId?.userId?.firstName} {appt.doctorId?.userId?.lastName}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={S.td}>
                            <span style={S.statusBadge(appt.status)}>{appt.status}</span>
                          </td>

                          {/* Reporting Time — inline edit */}
                          <td style={S.td}>
                            {editingId === appt._id ? (
                              <div>
                                <input
                                  type="datetime-local"
                                  value={editingTime}
                                  onChange={(e) => setEditingTime(e.target.value)}
                                  style={S.datetimeInput}
                                />
                                <div>
                                  <button
                                    onClick={handleSave}
                                    disabled={updateLoading}
                                    style={{ ...S.saveBtn, opacity: updateLoading ? 0.6 : 1 }}
                                  >
                                    {updateLoading ? 'Saving…' : 'Save'}
                                  </button>
                                  <button onClick={handleCancel} style={S.cancelEditBtn}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span
                                onClick={() => handleEdit(appt)}
                                style={appt.reportingTime ? S.timeDisplay : S.setTimeLink}
                                title="Click to edit"
                              >
                                {appt.reportingTime
                                  ? new Date(appt.reportingTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '+ Set time'}
                              </span>
                            )}
                          </td>

                        </tr>
                      ))}

                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#bbb' }}>
                            No appointments in the system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;