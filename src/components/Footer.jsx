import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/60">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>100% Privacy by Design</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every document conversion executes strictly on your self-hosted instance. Zero bytes are uploaded to Google, Adobe, CloudConvert, or third-party servers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/60">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span>Ephemeral Local Storage</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Files exist strictly in a temporary scratch folder and are automatically deleted after 30 minutes or immediately when you click Delete.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/60">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>No AI or Cloud APIs</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Powered purely by open-source libraries: PyMuPDF, pdf2docx, Pillow, pandas, ReportLab, and Tesseract OCR.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            Private Document Converter • Self-Hosted &amp; Offline Ready
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link to="/privacy" className="hover:text-blue-600 font-medium transition-colors">Privacy Architecture</Link>
            <Link to="/status" className="hover:text-blue-600 font-medium transition-colors">System Dependencies</Link>
            <Link to="/utilities" className="hover:text-blue-600 font-medium transition-colors">PDF &amp; Image Utilities</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
