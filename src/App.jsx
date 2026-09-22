import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UtilitiesPage from './pages/UtilitiesPage';
import PrivacyPage from './pages/PrivacyPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f8faff] text-slate-900 selection:bg-blue-600 selection:text-white antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/utilities" element={<UtilitiesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
