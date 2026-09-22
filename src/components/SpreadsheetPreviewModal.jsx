import React from 'react';
import { X, Table, FileSpreadsheet } from 'lucide-react';

export default function SpreadsheetPreviewModal({ previewData, onClose }) {
  if (!previewData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl p-6 flex flex-col shadow-2xl border border-blue-100 bg-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {previewData.filename}
              </h3>
              <p className="text-xs text-slate-500">
                {previewData.total_rows} rows • {previewData.total_columns} columns • Sheet: <span className="font-semibold text-blue-600">{previewData.active_sheet}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table scroll area */}
        <div className="flex-1 overflow-auto my-4 rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-900 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-12 text-center text-slate-400">#</th>
                {previewData.columns.map((col, idx) => (
                  <th key={idx} className="p-2.5 border-l border-slate-200/60 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">{rIdx + 1}</td>
                  {previewData.columns.map((col, cIdx) => (
                    <td key={cIdx} className="p-2.5 border-l border-slate-100 whitespace-nowrap">
                      {row[col] !== undefined ? String(row[col]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>Displaying first {previewData.rows.length} rows for preview.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
