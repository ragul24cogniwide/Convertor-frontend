import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function PrivacyBadge({ detailed = false }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await fetchHealth();
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  if (!online) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Backend Offline</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>{detailed ? "Files never leave your machine • 12s Heartbeat Active" : "100% Local & Healthy"}</span>
    </div>
  );
}
