// src/components/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    maxWidth: '400px',
    boxSizing: 'border-box',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '2rem',
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
  fieldWrap: {
    marginBottom: '1.25rem',
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
  // NEW STYLES FOR PASSWORD WRAPPER & TOGGLE
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#0d3b6e',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  // NEW STYLE FOR INLINE VALIDATION ERRORS
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
  },
  dividerWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    border: 'none',
    borderTop: '1px solid #eee',
    margin: 0,
  },
  dividerText: {
    fontSize: '12px',
    color: '#bbb',
  },
  rolesRow: {
    display: 'flex',
    gap: '8px',
  },
  roleTag: {
    flex: 1,
    padding: '8px',
    border: '1px solid #eee',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
    background: 'transparent',
  },
  signupWrap: {
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // NEW: Toggle state
  
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({}); // NEW: Form validation state

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // NEW: Validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check local validation before sending to backend
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      const role = response.data.user.role;
      if (role === 'Admin') navigate('/admin-dashboard');
      else if (role === 'Doctor') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

        {/* Heading */}
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to your account to continue</p>

        {/* API Error */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate>
          {/* Email Field */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email address</label>
            <input
              style={{
                ...styles.input,
                borderColor: formErrors.email ? '#fca5a5' : '#dde1e7', // Red border on error
              }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); // Clear error on type
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = formErrors.email ? '#fca5a5' : '#dde1e7')}
            />
            {formErrors.email && <div style={styles.fieldError}>{formErrors.email}</div>}
          </div>

          {/* Password Field */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                style={{
                  ...styles.input,
                  paddingRight: '60px', // Make room for the toggle button
                  borderColor: formErrors.password ? '#fca5a5' : '#dde1e7',
                }}
                type={showPassword ? 'text' : 'password'} // Dynamic type
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
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
            style={styles.submitBtn}
            onMouseEnter={(e) => (e.target.style.background = '#0a2d56')}
            onMouseLeave={(e) => (e.target.style.background = '#0d3b6e')}
          >
            Sign in
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={styles.signupWrap}>
          Don't have an account?{' '}
          <span style={styles.linkText} onClick={() => navigate('/register')}>
            Sign up
          </span>
        </div>

        {/* Role hint */}
        <div style={styles.dividerWrap}>
          <hr style={styles.dividerLine} />
          <span style={styles.dividerText}>sign in as</span>
          <hr style={styles.dividerLine} />
        </div>
        <div style={styles.rolesRow}>
          {['Patient', 'Doctor', 'Admin'].map((r) => (
            <div key={r} style={styles.roleTag}>{r}</div>
          ))}
        </div>

        <p style={styles.footer}>SmartCare &copy; 2026 · Secure health portal</p>
      </div>
    </div>
  );
};

export default Login;