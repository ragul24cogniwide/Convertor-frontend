import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import ConversionMatrix from '../components/ConversionMatrix';
import ProgressCard from '../components/ProgressCard';
import DownloadCard from '../components/DownloadCard';
import SpreadsheetPreviewModal from '../components/SpreadsheetPreviewModal';
import { fetchConversions, convertFile, previewSpreadsheet } from '../services/api';

export default function HomePage() {
  const [registry, setRegistry] = useState(null);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [registryError, setRegistryError] = useState(null);

  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('pdf');
  const [targetFormat, setTargetFormat] = useState('');
  const [options, setOptions] = useState({});
  const [conversionType, setConversionType] = useState('convert');

  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    loadRegistry();
  }, []);

  const loadRegistry = async () => {
    setLoadingRegistry(true);
    setRegistryError(null);
    try {
      const data = await fetchConversions();
      setRegistry(data);
    } catch (err) {
      setRegistryError(err.message || 'Could not connect to backend server.');
    } finally {
      setLoadingRegistry(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setErrorMessage(null);

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    
    if (registry && registry.categories) {
      for (const [catKey, catData] of Object.entries(registry.categories)) {
        if (catData.formats.includes(ext)) {
          setSelectedCategory(catKey);
          const matchingConv = catData.conversions.find(c => c.input_format === ext && c.is_available);
          if (matchingConv) {
            setTargetFormat(matchingConv.output_format);
          } else {
            setTargetFormat('');
          }
          break;
        }
      }
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setTargetFormat('');
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) return;

    setStatus('uploading');
    setProgress(0);
    setErrorMessage(null);

    try {
      const res = await convertFile({
        file,
        targetFormat,
        conversionType,
        options,
        onProgress: (pct) => {
          setProgress(pct);
          if (pct === 100) {
            setStatus('processing');
          }
        }
      });

      setResult(res);
      setStatus('completed');
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during conversion.');
      setStatus('error');
    }
  };

  const handlePreviewSpreadsheet = async () => {
    if (!file) return;
    try {
      const data = await previewSpreadsheet(file);
      setPreviewData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to preview spreadsheet.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setTargetFormat('');
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  };

  const inputExt = file ? file.name.split('.').pop().toLowerCase() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-4 border border-blue-200/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>100% Local Engine • Zero Cloud Uploads</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Private Document Converter
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          Your files are processed locally. No third-party cloud upload.
        </p>
      </div>

      {/* Backend Connection Error */}
      {registryError && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Could not connect to FastAPI backend: {registryError}</span>
          </div>
          <button
            onClick={loadRegistry}
            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Conversion Flow */}
      {status === 'completed' && result ? (
        <DownloadCard result={result} onReset={handleReset} />
      ) : status === 'uploading' || status === 'processing' ? (
        <ProgressCard progress={progress} status={status} targetFormat={targetFormat} />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-xl shadow-blue-500/5 space-y-8">
          
          {/* File Dropzone */}
          <Dropzone
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            maxSizeMb={registry?.max_file_size_mb || 100}
          />

          {/* Target Format & Category Browser */}
          <ConversionMatrix
            registry={registry}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            inputExt={inputExt}
            targetFormat={targetFormat}
            onSelectTargetFormat={setTargetFormat}
            options={options}
            onOptionsChange={setOptions}
            onPreviewSpreadsheet={handlePreviewSpreadsheet}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Temporary files are automatically deleted after processing.</span>
            </div>

            <button
              onClick={handleConvert}
              disabled={!file || !targetFormat || status === 'processing'}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                !file || !targetFormat
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span>Convert Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Spreadsheet Preview Modal */}
      <SpreadsheetPreviewModal
        previewData={previewData}
        onClose={() => setPreviewData(null)}
      />

    </div>
  );
}
