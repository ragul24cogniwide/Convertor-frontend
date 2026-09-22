import React, { useState } from 'react';
import { CheckCircle2, Download, Archive, Trash2, ArrowLeft, Clock } from 'lucide-react';
import { deleteJob } from '../services/api';

export default function DownloadCard({ result, onReset }) {
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isMultiFile = result.output_files && result.output_files.length > 1;

  const handleDownload = (zipAll = false) => {
    const url = `/api/jobs/${result.job_id}/download${zipAll ? '?zip_all=true' : ''}`;
    window.location.href = url;
  };

  const handleDeleteNow = async () => {
    setDeleting(true);
    try {
      await deleteJob(result.job_id);
      setDeleted(true);
    } catch {
      // Ignored
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-blue-100 text-center shadow-xl shadow-blue-500/10 max-w-lg mx-auto">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <h3 className="text-2xl font-extrabold text-slate-900">
        Conversion completed successfully
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Generated: <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{result.output_filename}</span>
        {isMultiFile && ` (+ ${result.output_files.length - 1} more items)`}
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => handleDownload(false)}
          disabled={deleted}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${
            deleted
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </button>

        {isMultiFile && (
          <button
            onClick={() => handleDownload(true)}
            disabled={deleted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition-all shadow-xs"
          >
            <Archive className="w-4 h-4 text-amber-500" />
            <span>Download All as ZIP</span>
          </button>
        )}
      </div>

      {/* Privacy Notice & Instant Delete */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Your temporary files will be automatically deleted in 30 minutes.</span>
        </div>

        {!deleted ? (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span>Want immediate erasure?</span>
            <button
              onClick={handleDeleteNow}
              disabled={deleting}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Purging..." : "Delete from server now"}</span>
            </button>
          </div>
        ) : (
          <div className="text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-lg inline-block border border-emerald-100">
            ✓ Temporary files permanently deleted from server.
          </div>
        )}
      </div>

      {/* Reset button */}
      <div className="mt-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Convert another document</span>
        </button>
      </div>

    </div>
  );
}
