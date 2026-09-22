import React from 'react';
import { ShieldCheck, Server, Trash2, Database, EyeOff, Bot, Lock } from 'lucide-react';
import PrivacyBadge from '../components/PrivacyBadge';

export default function PrivacyPage() {
  const guarantees = [
    {
      title: "100% Local Self-Hosted Processing",
      desc: "All conversions run directly on your own host machine or inside your Docker container. Your documents never leave your server's local storage.",
      icon: <Server className="w-5 h-5 text-blue-600" />
    },
    {
      title: "Zero Third-Party Cloud Transmission",
      desc: "We never upload files or make requests to Google Drive, Microsoft Graph, Adobe PDF, CloudConvert, Convertio, iLovePDF, Smallpdf, or any SaaS conversion endpoint.",
      icon: <EyeOff className="w-5 h-5 text-purple-600" />
    },
    {
      title: "No Artificial Intelligence (AI) API Calls",
      desc: "Zero document content, text, or metadata is ever forwarded to OpenAI, Anthropic, Google Gemini, or any LLM/AI provider. All transformations use deterministic open-source algorithms.",
      icon: <Bot className="w-5 h-5 text-emerald-600" />
    },
    {
      title: "Ephemeral Workspaces & Auto-Deletion",
      desc: "Uploaded files exist only in an isolated temporary folder (temp/{job_id}). Files are automatically deleted after the retention TTL (30 minutes) or immediately upon user request.",
      icon: <Trash2 className="w-5 h-5 text-rose-600" />
    },
    {
      title: "No Persistent Document Storage",
      desc: "No database holds your file contents. Once a job workspace is cleaned, all input, intermediate, and output files are permanently unlinked and erased from disk.",
      icon: <Database className="w-5 h-5 text-amber-600" />
    },
    {
      title: "Zero Document Content in LocalStorage",
      desc: "Your browser's localStorage is never used for storing document bytes or sensitive information. No document tracking cookies exist.",
      icon: <Lock className="w-5 h-5 text-indigo-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="mb-4">
          <PrivacyBadge detailed={true} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Architecture &amp; Guarantees
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          Convertor was built with an uncompromising privacy architecture: complete local execution, zero cloud dependency, and transparent automatic file hygiene.
        </p>
      </div>

      {/* Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {guarantees.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Lifecycle Flowchart */}
      <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Document Lifecycle in Your Local Environment
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <strong className="text-slate-900">Upload to Local Backend:</strong> Your file is streamed directly from your browser to your localhost FastAPI server via HTTP multipart/form-data.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <strong className="text-slate-900">Ephemeral Sandboxing:</strong> The backend assigns a UUID v4 job ID and places the document in <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-xs border border-blue-100">temp/&lt;job-id&gt;/input/</code> with sanitized filenames.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <strong className="text-slate-900">Local Execution:</strong> PyMuPDF, Pillow, openpyxl, pandas, or headless LibreOffice process the document strictly in RAM and local scratch disk.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">4</div>
            <div>
              <strong className="text-slate-900">Direct Stream &amp; Cleanup:</strong> You download the output directly from your localhost. An asynchronous background worker scans the temporary directory every 5 minutes and permanently deletes files exceeding the 30-minute TTL. You can also click "Delete from server now" to wipe files instantaneously.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
