import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Terminal, Check, Info } from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHealth();
    const timer = setInterval(() => {
      loadHealth();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Could not connect to health endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-2 border border-blue-200">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Local Engine Diagnostics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System &amp; Dependency Status
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify installed local libraries and CLI conversion binaries.
          </p>
        </div>

        <button
          onClick={loadHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Backend unreachable: {error}</span>
        </div>
      )}

      {health && (
        <div className="space-y-6">
          
          {/* Engine Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(health.dependencies).map(([key, dep]) => (
              <div
                key={key}
                className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <span>{dep.name}</span>
                    {dep.installed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Installed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Not Found
                      </span>
                    )}
                  </div>
                  {dep.version && (
                    <div className="text-xs text-blue-600 mt-1 font-mono font-medium">
                      Version: {dep.version}
                    </div>
                  )}
                  {dep.details && (
                    <div className="text-xs text-slate-500 mt-1">
                      {dep.details}
                    </div>
                  )}
                </div>

                <div className="pl-3">
                  {dep.installed ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Parameters */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Runtime Server Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1 font-medium">Max Upload File Size</span>
                <span className="text-lg font-extrabold text-blue-900">{health.max_file_size_mb} MB</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1 font-medium">Temporary Retention TTL</span>
                <span className="text-lg font-extrabold text-blue-900">{health.temp_file_ttl_minutes} Minutes</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <span className="text-slate-500 block mb-1 font-medium">OCR Languages Loaded</span>
                <span className="text-lg font-extrabold text-blue-900 uppercase">
                  {health.ocr_languages.length > 0 ? health.ocr_languages.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Engine Setup Instructions if missing */}
          {(!health.dependencies.libreoffice?.installed || !health.dependencies.tesseract?.installed) && (
            <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>How to Install Optional CLI Binaries</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core PDF, Word (TXT/HTML), Spreadsheets, Images, and Markdown conversions work out of the box. To unlock DOCX→PDF, PPTX→PDF, and OCR on this host machine, run:
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white border border-blue-200 text-slate-800 shadow-xs">
                  <span className="text-slate-400 block mb-0.5"># macOS (Homebrew)</span>
                  brew install --cask libreoffice &amp;&amp; brew install tesseract tesseract-lang
                </div>
                <div className="p-3 rounded-xl bg-white border border-blue-200 text-slate-800 shadow-xs">
                  <span className="text-slate-400 block mb-0.5"># Ubuntu / Debian</span>
                  sudo apt-get install libreoffice tesseract-ocr tesseract-ocr-eng tesseract-ocr-tam
                </div>
                <div className="p-3 rounded-xl bg-blue-600 text-white font-bold shadow-xs">
                  <span className="text-blue-200 block mb-0.5 font-normal"># Or run inside Docker (Includes everything pre-configured)</span>
                  docker compose up --build
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
