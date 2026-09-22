import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileCode, ShieldCheck } from 'lucide-react';
import PrivacyBadge from './PrivacyBadge';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Converter', path: '/' },
    { name: 'Utilities', path: '/utilities' },
    { name: 'Privacy Guarantee', path: '/privacy' },
    { name: 'System Status', path: '/status' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg text-slate-900 tracking-tight">
                Convertor <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">Local</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side badge */}
        <div className="flex items-center gap-3">
          <PrivacyBadge />
        </div>

      </div>
    </header>
  );
}
