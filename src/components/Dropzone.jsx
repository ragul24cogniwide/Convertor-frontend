import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, FileText, Table, Image, BookOpen, Shield } from 'lucide-react';

export default function Dropzone({
  file,
  onFileSelect,
  onFileRemove,
  acceptedExtensions = [],
  maxSizeMb = 100
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (selectedFile) => {
    setDragError(null);
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMb * 1024 * 1024) {
      setDragError(`File exceeds the maximum allowed size of ${maxSizeMb} MB.`);
      return;
    }

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (acceptedExtensions.length > 0 && !acceptedExtensions.includes(ext)) {
      setDragError(`Unsupported file format .${ext}. Please choose a supported file.`);
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="w-8 h-8 text-rose-500" />;
    if (['docx', 'doc', 'odt', 'rtf'].includes(ext)) return <FileText className="w-8 h-8 text-blue-600" />;
    if (['xlsx', 'xls', 'csv', 'ods', 'tsv'].includes(ext)) return <Table className="w-8 h-8 text-emerald-600" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) return <Image className="w-8 h-8 text-purple-600" />;
    if (['epub'].includes(ext)) return <BookOpen className="w-8 h-8 text-amber-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group bg-white ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10'
              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Drop your file here
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            or <span className="text-blue-600 font-semibold underline underline-offset-4 hover:text-blue-700">Browse Files</span> from your computer
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 bg-blue-50/80 border border-blue-100">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Files are processed privately on your local machine (Up to {maxSizeMb} MB)</span>
          </div>

          {dragError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dragError}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-blue-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              {getFileIcon(file.name)}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
                {file.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="uppercase font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {file.name.split('.').pop()}
                </span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">Ready to convert</span>
              </div>
            </div>
          </div>

          <button
            onClick={onFileRemove}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
