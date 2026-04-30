import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard'; // 1. IMPORT THIS
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import Register from './components/Register';
// A wrapper component to protect routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

        {/* Protected Patient Route */}
        <Route 
          path="/patient-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboard/>
            </ProtectedRoute>
          } 
        />

        {/* Protected Doctor Route */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard/>
            </ProtectedRoute>
          } 
        />
        
        {/* FIXED: Protected Admin Route */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}> {/* 2. CHANGE TO 'Admin' */}
              <AdminDashboard />                      {/* 3. RENDER THE COMPONENT */}
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;