import React from "react";
import { AuthProvider } from './context/AuthContext.jsx';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext.jsx';

// Components
import NavBar from './components/ui/componentslite/NavBar.jsx';
import Home from './components/ui/componentslite/Home.jsx';
import PrivacyPolicy from './components/ui/componentslite/PrivacyPolicy.jsx';
import Jobs from './components/ui/componentslite/Jobs.jsx';
import Profile from './components/ui/componentslite/Profile.jsx';
import JobDetail from './components/ui/componentslite/JobDetail.jsx';
import JobApplicationForm from './components/ui/componentslite/JobApplicationForm.jsx';
import ComingSoon from './components/ui/componentslite/ComingSoon.jsx';
import Posts from './components/ui/componentslite/Posts.jsx';
import Network from './components/ui/componentslite/Network.jsx';
import PublicProfile from './components/ui/componentslite/PublicProfile.jsx';
import StudentDashboard from './components/ui/componentslite/StudentDashboard.jsx';
import AlumniDashboard from './components/ui/componentslite/AlumniDashboard.jsx';
import AdminDashboard from './components/ui/componentslite/AdminDashboard.jsx';
import JobApplicationPage from './components/ui/componentslite/JobApplicationPage.jsx';
import Login from './components/ui/authentication/Login.jsx';
import Register from './components/ui/authentication/Register.jsx';
import OtpVerification from './components/ui/authentication/OtpVerification.jsx';

// Root: redirect to /login if not logged in, else /home
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

// Protect routes — redirect to /login if not authenticated
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const userRole = user.role?.toLowerCase();
  if (roles && !roles.includes(userRole)) return <Navigate to="/home" replace />;
  return children;
};

function AppInner() {
  const { loading } = useAuth();
  return (
    <HashRouter>
      <NavBar />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <Routes>
          {/* Root — redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verification" element={<OtpVerification />} />

          {/* Public pages (accessible after login) */}
          <Route path="/home" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><Home /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><JobDetail /></ProtectedRoute>} />
          <Route path="/apply/:jobId" element={<ProtectedRoute roles={['student']}><JobApplicationPage /></ProtectedRoute>} />
          <Route path="/posts" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><Posts /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><Network /></ProtectedRoute>} />
          <Route path="/network/profile/:userId" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><PublicProfile /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/internships" element={<ComingSoon />} />
          <Route path="/terms" element={<ComingSoon />} />
          <Route path="/post-job" element={<ComingSoon />} />

          {/* Dashboards */}
          <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/alumni/dashboard" element={<ProtectedRoute roles={['alumni','alumini']}><AlumniDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['student','alumni','alumini','admin']}><Profile /></ProtectedRoute>} />
        </Routes>
      )}
    </HashRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
