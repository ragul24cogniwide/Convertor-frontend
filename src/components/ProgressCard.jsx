import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function ProgressCard({ progress, status, targetFormat }) {
  const isUploading = progress < 100 && status === 'uploading';

  return (
    <div className="bg-white rounded-3xl p-8 border border-blue-100 text-center shadow-xl shadow-blue-500/10 max-w-md mx-auto">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {isUploading ? "Streaming file to local engine..." : `Converting to ${targetFormat?.toUpperCase()}...`}
      </h3>

      <p className="mt-1.5 text-xs text-slate-500">
        {isUploading
          ? `Uploaded ${progress}% • Direct local transfer`
          : "Processing securely on your machine with native binaries"}
      </p>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1 px-3 rounded-full inline-flex border border-emerald-200/60">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>0% Cloud upload • Completely offline</span>
      </div>
    </div>
  );
}
