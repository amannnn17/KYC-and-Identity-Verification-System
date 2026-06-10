import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import VerificationFlow from './pages/VerificationFlow';
import AdminDashboard from './pages/AdminDashboard';
import SubmissionDetails from './pages/SubmissionDetails';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="verify" element={<VerificationFlow />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/submissions/:id" element={<SubmissionDetails />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
