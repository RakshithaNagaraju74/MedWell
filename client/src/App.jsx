// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Your existing AuthProvider
import { FirebaseUserProvider } from './context/FirebaseUserContext'; // <--- NEW IMPORT: FirebaseUserProvider
import LandingPage from './pages/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSetupWrapper from './components/ProfileSetupWrapper';
import RequireProfile from './components/RequireProfile';
import MedicineIdentifier from './components/MedicineIdentifier';
import PillIdentifier from './components/PillIdentifier';
import SymptomChecker from './components/SymptomChecker';
import Logout from './components/Logout';
import GuidedMeditation from './components/GuidedMeditation';
import About from './components/About';    
function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Wrap your Routes with FirebaseUserProvider */}
        <FirebaseUserProvider> {/* <--- NEW WRAPPER */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/medicine" element={<MedicineIdentifier />} />
            <Route path="/pill" element={<PillIdentifier />} />
            <Route path="/symptom" element={<SymptomChecker />} />
            <Route path="/" element={<RequireProfile><Dashboard /></RequireProfile>} />
            <Route path="/meditation" element={<GuidedMeditation />} />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetupWrapper />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* If DocumentManager is directly a route, add it here too: */}
            {/* <Route
              path="/documents" // Example path for DocumentManager
              element={
                <ProtectedRoute>
                  <DocumentManager onBackClick={() => {}} /> // Make sure to import DocumentManager
                </ProtectedRoute>
              }
            /> */}

            {/* Redirect unknown routes to landing page */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </FirebaseUserProvider> {/* <--- END NEW WRAPPER */}
      </AuthProvider>
    </Router>
  );
}

export default App;