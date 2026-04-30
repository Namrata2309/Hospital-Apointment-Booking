// src/components/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0ede8',
    padding: '2rem',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '0.5px solid #dde1e7',
    padding: '2.5rem 2.75rem',
    width: '100%',
    maxWidth: '450px', 
    boxSizing: 'border-box',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    background: '#0d3b6e',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '20px',
    color: '#0d1f3c',
    letterSpacing: '-0.3px',
    fontWeight: 'normal',
  },
  heading: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '26px',
    color: '#0d1f3c',
    margin: '0 0 6px',
    fontWeight: 'normal',
  },
  subheading: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 2rem',
    fontWeight: '300',
  },
  rowWrap: {
    display: 'flex',
    gap: '10px',
    marginBottom: '1.25rem',
  },
  fieldWrap: {
    marginBottom: '1.25rem',
    flex: 1,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: '0 0 6px 0',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #dde1e7',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: '#1a1a2e',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fafafa',
    transition: 'border-color 0.2s',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  fieldError: {
    color: '#b91c1c',
    fontSize: '11px',
    marginTop: '6px',
    fontWeight: '500',
  },
  errorBox: {
    background: '#fff5f5',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '1.25rem',
  },
  successBox: {
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '1.25rem',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#0d3b6e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'background 0.2s',
    marginTop: '10px',
  },
  loginWrap: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '14px',
    color: '#555',
  },
  linkText: {
    color: '#0d3b6e',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '13px',
    color: '#bbb',
  },
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'Patient', 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Force phone field to only accept numbers immediately upon typing
    if (name === 'phone') {
      value = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this specific field when the user starts typing again
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    else if (!nameRegex.test(formData.firstName)) errors.firstName = 'Only alphabets allowed';

    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    else if (!nameRegex.test(formData.lastName)) errors.lastName = 'Only alphabets allowed';

    if (!formData.email) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.phone) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Must be exactly 10 digits';

    if (!formData.password) errors.password = 'Password is required';
    else if (!passwordRegex.test(formData.password)) {
      errors.password = '8+ chars, uppercase, lowercase, number & symbol required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3a3 3 0 110 6 3 3 0 010-6zm0 10.5a6 6 0 01-4.59-2.14C6.55 12.14 8.18 11.5 10 11.5s3.45.64 4.59 1.86A6 6 0 0110 15.5z"
                fill="#ffffff"
              />
            </svg>
          </div>
          <span style={styles.logoText}>SmartCare</span>
        </div>

        <h1 style={styles.heading}>Create an account</h1>
        <p style={styles.subheading}>Join SmartCare to book your appointments</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleRegister} noValidate>
          
          <div style={styles.rowWrap}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>First Name</label>
              <input
                style={{ ...styles.input, borderColor: formErrors.firstName ? '#fca5a5' : '#dde1e7' }}
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = formErrors.firstName ? '#fca5a5' : '#dde1e7')}
              />
              {formErrors.firstName && <div style={styles.fieldError}>{formErrors.firstName}</div>}
            </div>
            
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Last Name</label>
              <input
                style={{ ...styles.input, borderColor: formErrors.lastName ? '#fca5a5' : '#dde1e7' }}
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = formErrors.lastName ? '#fca5a5' : '#dde1e7')}
              />
              {formErrors.lastName && <div style={styles.fieldError}>{formErrors.lastName}</div>}
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email address</label>
            <input
              style={{ ...styles.input, borderColor: formErrors.email ? '#fca5a5' : '#dde1e7' }}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = formErrors.email ? '#fca5a5' : '#dde1e7')}
            />
            {formErrors.email && <div style={styles.fieldError}>{formErrors.email}</div>}
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Phone Number</label>
            <input
              style={{ ...styles.input, borderColor: formErrors.phone ? '#fca5a5' : '#dde1e7' }}
              type="tel"
              name="phone"
              maxLength="10"
              placeholder="1234567890"
              value={formData.phone}
              onChange={handleChange}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = formErrors.phone ? '#fca5a5' : '#dde1e7')}
            />
            {formErrors.phone && <div style={styles.fieldError}>{formErrors.phone}</div>}
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                style={{ 
                  ...styles.input, 
                  paddingRight: '45px', 
                  borderColor: formErrors.password ? '#fca5a5' : '#dde1e7' 
                }}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = formErrors.password ? '#fca5a5' : '#dde1e7')}
              />
              <button 
                type="button" 
                style={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d3b6e'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && <div style={styles.fieldError}>{formErrors.password}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={(e) => (e.target.style.background = '#0a2d56')}
            onMouseLeave={(e) => (e.target.style.background = '#0d3b6e')}
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>

        <div style={styles.loginWrap}>
          Already have an account?{' '}
          <span style={styles.linkText} onClick={() => navigate('/login')}>
            Sign in
          </span>
        </div>

        <p style={styles.footer}>SmartCare &copy; 2025 · Secure health portal</p>
      </div>
    </div>
  );
};

export default Register;