import React, { useState } from 'react';
import {
  Wrench,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Stamp,
  RotateCw,
  Minimize2,
  Layers,
  Files,
  Hash,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Sliders,
  X,
  ShieldAlert
} from 'lucide-react';
import { executeUtility } from '../services/api';

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState('pdf_compress');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [downloadBlob, setDownloadBlob] = useState(null);
  const [downloadName, setDownloadName] = useState('result.pdf');

  // Common file states
  const [files, setFiles] = useState([]);
  const [singleFile, setSingleFile] = useState(null);

  // Compress PDF state
  const [compressPreset, setCompressPreset] = useState('balanced'); // 'balanced', 'extreme', 'high_quality', 'custom'
  const [compressQuality, setCompressQuality] = useState(65);
  const [compressDpi, setCompressDpi] = useState('150');
  const [compressGrayscale, setCompressGrayscale] = useState(false);
  const [compressStripMeta, setCompressStripMeta] = useState(true);

  // Watermark PDF state
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState(36);
  const [watermarkColor, setWatermarkColor] = useState('gray');
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [watermarkOnTop, setWatermarkOnTop] = useState(true);

  // Split PDF state
  const [splitMode, setSplitMode] = useState('pages'); // 'pages', 'all', 'chunk'
  const [splitPages, setSplitPages] = useState('1-3');
  const [splitChunkSize, setSplitChunkSize] = useState(2);

  // Rotate PDF state
  const [rotateAngle, setRotateAngle] = useState(90);
  const [rotateScope, setRotateScope] = useState('all'); // 'all', 'odd', 'even', 'custom'
  const [rotatePages, setRotatePages] = useState('');

  // Protect & Unlock PDF state
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfOwnerPassword, setPdfOwnerPassword] = useState('');
  const [pdfAllowPrint, setPdfAllowPrint] = useState(true);
  const [pdfAllowCopy, setPdfAllowCopy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');

  // Page Numbers state
  const [pageNumberFormat, setPageNumberFormat] = useState('Page {page} of {total}');
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom_center');
  const [pageNumberStart, setPageNumberStart] = useState(1);
  const [pageNumberSize, setPageNumberSize] = useState(10);

  // Delete Pages state
  const [deletePagesInput, setDeletePagesInput] = useState('');

  // Extract Images state
  const [extractMinDim, setExtractMinDim] = useState(50);
  const [extractFormat, setExtractFormat] = useState('original');

  // Image Optimizer state
  const [imageQuality, setImageQuality] = useState(85);
  const [imageFormat, setImageFormat] = useState('original');
  const [imageResizeMode, setImageResizeMode] = useState('original'); // 'original', 'scale', 'width'
  const [imageScalePct, setImageScalePct] = useState(50);
  const [imageCustomWidth, setImageCustomWidth] = useState('');
  const [imageStripMetadata, setImageStripMetadata] = useState(true);

  // Merge & Album state
  const [mergeOutputName, setMergeOutputName] = useState('merged_document.pdf');
  const [albumOutputName, setAlbumOutputName] = useState('photo_album.pdf');

  // Spreadsheet split state
  const [sheetTargetExt, setSheetTargetExt] = useState('xlsx');

  const resetState = () => {
    setFiles([]);
    setSingleFile(null);
    setDownloadBlob(null);
    setErrorMessage(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetState();
  };

  const applyCompressPreset = (preset) => {
    setCompressPreset(preset);
    if (preset === 'balanced') {
      setCompressQuality(65);
      setCompressDpi('150');
      setCompressGrayscale(false);
      setCompressStripMeta(true);
    } else if (preset === 'extreme') {
      setCompressQuality(35);
      setCompressDpi('96');
      setCompressGrayscale(true);
      setCompressStripMeta(true);
    } else if (preset === 'high_quality') {
      setCompressQuality(85);
      setCompressDpi('200');
      setCompressGrayscale(false);
      setCompressStripMeta(true);
    }
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIdx];
    newFiles[targetIdx] = temp;
    setFiles(newFiles);
  };

  const removeFileAtIndex = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const runOperation = async () => {
    setLoading(true);
    setErrorMessage(null);
    setDownloadBlob(null);

    const formData = new FormData();

    try {
      let endpoint = '';
      let outName = 'converted_file';

      if (activeTab === 'pdf_compress') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('quality', compressQuality);
        if (compressDpi) formData.append('dpi', compressDpi);
        formData.append('grayscale', compressGrayscale);
        formData.append('strip_metadata', compressStripMeta);
        endpoint = '/pdf/compress';
        outName = `${singleFile.name.replace('.pdf', '')}_compressed.pdf`;

      } else if (activeTab === 'pdf_merge') {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
        for (const f of files) formData.append('files', f);
        endpoint = '/pdf/merge';
        outName = mergeOutputName.endsWith('.pdf') ? mergeOutputName : `${mergeOutputName}.pdf`;

      } else if (activeTab === 'pdf_split') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('mode', splitMode);
        if (splitMode === 'pages' && splitPages) {
          formData.append('pages', splitPages);
        } else if (splitMode === 'chunk') {
          formData.append('chunk_size', splitChunkSize);
        }
        endpoint = '/pdf/split';
        outName = splitMode === 'pages' && !splitPages.includes(',') && !splitPages.includes('-')
          ? `${singleFile.name.replace('.pdf', '')}_page_${splitPages}.pdf`
          : `${singleFile.name.replace('.pdf', '')}_split.zip`;

      } else if (activeTab === 'pdf_watermark') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('text', watermarkText);
        formData.append('opacity', watermarkOpacity);
        formData.append('size', watermarkFontSize);
        formData.append('color', watermarkColor);
        formData.append('angle', watermarkAngle);
        formData.append('on_top', watermarkOnTop);
        endpoint = '/pdf/watermark';
        outName = `${singleFile.name.replace('.pdf', '')}_watermarked.pdf`;

      } else if (activeTab === 'pdf_rotate') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('angle', rotateAngle);
        formData.append('scope', rotateScope);
        if (rotateScope === 'custom' && rotatePages) {
          formData.append('pages', rotatePages);
        }
        endpoint = '/pdf/rotate';
        outName = `${singleFile.name.replace('.pdf', '')}_rotated.pdf`;

      } else if (activeTab === 'pdf_protect') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        if (!pdfPassword) throw new Error('Please enter a user encryption password.');
        formData.append('file', singleFile);
        formData.append('password', pdfPassword);
        if (pdfOwnerPassword) formData.append('owner_password', pdfOwnerPassword);
        formData.append('allow_print', pdfAllowPrint);
        formData.append('allow_copy', pdfAllowCopy);
        endpoint = '/pdf/protect';
        outName = `${singleFile.name.replace('.pdf', '')}_protected.pdf`;

      } else if (activeTab === 'pdf_unlock') {
        if (!singleFile) throw new Error('Please select an encrypted PDF file.');
        if (!unlockPassword) throw new Error('Please enter the PDF password to decrypt.');
        formData.append('file', singleFile);
        formData.append('password', unlockPassword);
        endpoint = '/pdf/unlock';
        outName = `${singleFile.name.replace('.pdf', '')}_unprotected.pdf`;

      } else if (activeTab === 'pdf_page_numbers') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('format_pattern', pageNumberFormat);
        formData.append('position', pageNumberPosition);
        formData.append('start_page', pageNumberStart);
        formData.append('size', pageNumberSize);
        endpoint = '/pdf/add-page-numbers';
        outName = `${singleFile.name.replace('.pdf', '')}_numbered.pdf`;

      } else if (activeTab === 'pdf_delete_pages') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        if (!deletePagesInput.trim()) throw new Error('Please specify page numbers to delete (e.g. 2, 4-6).');
        formData.append('file', singleFile);
        formData.append('pages', deletePagesInput);
        endpoint = '/pdf/delete-pages';
        outName = `${singleFile.name.replace('.pdf', '')}_edited.pdf`;

      } else if (activeTab === 'pdf_extract_images') {
        if (!singleFile) throw new Error('Please select a PDF file.');
        formData.append('file', singleFile);
        formData.append('min_dimension', extractMinDim);
        formData.append('output_format', extractFormat);
        endpoint = '/pdf/extract-images';
        outName = `${singleFile.name.replace('.pdf', '')}_images.zip`;

      } else if (activeTab === 'image_optimize') {
        if (!singleFile) throw new Error('Please select an image.');
        formData.append('file', singleFile);
        formData.append('quality', imageQuality);
        if (imageFormat !== 'original') formData.append('target_format', imageFormat);
        if (imageResizeMode === 'scale') formData.append('scale_percent', imageScalePct);
        if (imageResizeMode === 'width' && imageCustomWidth) formData.append('width', imageCustomWidth);
        formData.append('strip_metadata', imageStripMetadata);
        endpoint = '/image/optimize';
        const targetExt = imageFormat !== 'original' ? imageFormat : singleFile.name.split('.').pop();
        outName = `${singleFile.name.split('.')[0]}_optimized.${targetExt}`;

      } else if (activeTab === 'image_to_pdf') {
        if (files.length < 1) throw new Error('Please select at least 1 image.');
        for (const f of files) formData.append('files', f);
        endpoint = '/image/combine-to-pdf';
        outName = albumOutputName.endsWith('.pdf') ? albumOutputName : `${albumOutputName}.pdf`;

      } else if (activeTab === 'sheet_split') {
        if (!singleFile) throw new Error('Please select an Excel or spreadsheet file.');
        formData.append('file', singleFile);
        formData.append('target_ext', sheetTargetExt);
        endpoint = '/spreadsheet/split-sheets';
        outName = `${singleFile.name.split('.')[0]}_sheets.zip`;
      }

      const blob = await executeUtility(endpoint, formData);
      setDownloadBlob(blob);
      setDownloadName(outName);
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    if (!downloadBlob) return;
    const url = window.URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const utilityNav = [
    { id: 'pdf_compress', name: 'Compress PDF', badge: 'Adjustable', icon: <Minimize2 className="w-4 h-4 text-blue-600" /> },
    { id: 'pdf_merge', name: 'Merge PDF', badge: 'Reorderable', icon: <Files className="w-4 h-4 text-indigo-600" /> },
    { id: 'pdf_split', name: 'Split PDF', badge: 'Multi-mode', icon: <Layers className="w-4 h-4 text-purple-600" /> },
    { id: 'pdf_watermark', name: 'Watermark PDF', badge: 'Styling', icon: <Stamp className="w-4 h-4 text-cyan-600" /> },
    { id: 'pdf_page_numbers', name: 'Add Page Numbers', badge: 'Layouts', icon: <Hash className="w-4 h-4 text-emerald-600" /> },
    { id: 'pdf_rotate', name: 'Rotate PDF', badge: 'Scopes', icon: <RotateCw className="w-4 h-4 text-amber-600" /> },
    { id: 'pdf_protect', name: 'Protect PDF', badge: 'AES-256', icon: <Lock className="w-4 h-4 text-rose-600" /> },
    { id: 'pdf_unlock', name: 'Unlock PDF', badge: 'Decrypt', icon: <Unlock className="w-4 h-4 text-teal-600" /> },
    { id: 'pdf_delete_pages', name: 'Delete Pages', badge: 'Edit', icon: <Trash2 className="w-4 h-4 text-red-600" /> },
    { id: 'pdf_extract_images', name: 'Extract Images', badge: 'Filter', icon: <Archive className="w-4 h-4 text-violet-600" /> },
    { id: 'image_optimize', name: 'Image Optimizer', badge: 'Sliders', icon: <ImageIcon className="w-4 h-4 text-pink-600" /> },
    { id: 'image_to_pdf', name: 'Images to PDF Album', badge: 'Multi', icon: <FileText className="w-4 h-4 text-blue-700" /> },
    { id: 'sheet_split', name: 'Split Excel Sheets', badge: 'ZIP', icon: <FileSpreadsheet className="w-4 h-4 text-green-600" /> },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isMultiFileMode = ['pdf_merge', 'image_to_pdf'].includes(activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-3 border border-blue-200/80 shadow-xs">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          <span>Local Engine • 13 Fine-Tuned Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Specialized Offline Utilities
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Fine-tune compression levels, watermark styling, page splits, and transformations with zero cloud uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Navigation Bar */}
        <div className="lg:col-span-4 bg-white p-3 rounded-3xl border border-blue-100 shadow-md shadow-blue-500/5 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Operations
          </div>
          {utilityNav.map((tool) => {
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleTabChange(tool.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : ''}>{tool.icon}</span>
                  <span>{tool.name}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tool.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Configuration & Action Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6">
          
          {/* Active Tool Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>{utilityNav.find(u => u.id === activeTab)?.name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure adjustments and execute locally on your machine.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </div>
          </div>

          {/* File Picker Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isMultiFileMode ? 'Select Document(s) to Process' : 'Select Input File'}
            </label>
            
            <input
              type="file"
              multiple={isMultiFileMode}
              accept={
                activeTab.startsWith('pdf')
                  ? '.pdf'
                  : activeTab.startsWith('image')
                  ? 'image/*'
                  : '.xlsx,.xls,.csv,.ods'
              }
              onChange={(e) => {
                if (isMultiFileMode) {
                  setFiles(Array.from(e.target.files));
                } else {
                  setSingleFile(e.target.files[0] || null);
                }
              }}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-blue-100 rounded-2xl p-1.5 bg-blue-50/20 focus:outline-none"
            />

            {/* Selected File Details */}
            {singleFile && !isMultiFileMode && (
              <div className="mt-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">{singleFile.name}</span>
                  <span className="text-[11px] text-slate-500 shrink-0">({formatFileSize(singleFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSingleFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Multi-File Ordered List with Move Up/Down */}
            {isMultiFileMode && files.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Selected Queue ({files.length} files) — Arrange order:</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {files.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-100">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-md">{f.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({formatFileSize(f.size)})</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveFile(idx, -1)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === files.length - 1}
                          onClick={() => moveFile(idx, 1)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFileAtIndex(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* GRANULAR TOOL CONTROLS */}
          {/* ========================================================= */}

          {/* 1. COMPRESS PDF CONTROLS */}
          {activeTab === 'pdf_compress' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Compression Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced', desc: 'Recommended', color: 'border-blue-300' },
                    { id: 'extreme', label: 'Extreme', desc: 'Smallest file', color: 'border-purple-300' },
                    { id: 'high_quality', label: 'High Quality', desc: 'Mild compress', color: 'border-emerald-300' },
                    { id: 'custom', label: 'Custom', desc: 'Sliders below', color: 'border-slate-300' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyCompressPreset(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        compressPreset === p.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 hover:border-blue-200 border-slate-200/80'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className={`text-[10px] ${compressPreset === p.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression Quality Slider Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Image Recompression Quality</span>
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {compressQuality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={compressQuality}
                  onChange={(e) => {
                    setCompressQuality(parseInt(e.target.value));
                    setCompressPreset('custom');
                  }}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10% (Maximum compression)</span>
                  <span>50%</span>
                  <span>100% (Lossless / High-res)</span>
                </div>
              </div>

              {/* Target DPI Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Image Downsampling (Max Resolution)
                  </label>
                  <select
                    value={compressDpi}
                    onChange={(e) => {
                      setCompressDpi(e.target.value);
                      setCompressPreset('custom');
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="72">72 DPI — Mobile &amp; Screen Reading</option>
                    <option value="96">96 DPI — Standard Web Viewing</option>
                    <option value="150">150 DPI — Office Documents (Recommended)</option>
                    <option value="200">200 DPI — High-Definition eBooks</option>
                    <option value="300">300 DPI — Print Ready</option>
                  </select>
                </div>

                {/* Grayscale and Metadata Toggles */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="comp_gray"
                      checked={compressGrayscale}
                      onChange={(e) => {
                        setCompressGrayscale(e.target.checked);
                        setCompressPreset('custom');
                      }}
                      className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="comp_gray" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Convert color pages &amp; images to Grayscale
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="comp_meta"
                      checked={compressStripMeta}
                      onChange={(e) => {
                        setCompressStripMeta(e.target.checked);
                        setCompressPreset('custom');
                      }}
                      className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="comp_meta" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Strip document metadata, revisions, &amp; bookmarks
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Using PyMuPDF native C-level rewrite engine + Deflate stream compaction (Garbage Collection Level 4).
                </span>
              </div>
            </div>
          )}

          {/* 2. MERGE PDF CONTROLS */}
          {activeTab === 'pdf_merge' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Output Filename
                </label>
                <input
                  type="text"
                  value={mergeOutputName}
                  onChange={(e) => setMergeOutputName(e.target.value)}
                  className="w-full max-w-sm text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <p className="text-xs text-slate-500">
                Documents will be stitched in the sequence listed above. Use the Move Up / Move Down buttons to reorder.
              </p>
            </div>
          )}

          {/* 3. SPLIT PDF CONTROLS */}
          {activeTab === 'pdf_split' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Split Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pages', label: 'Extract Specific Pages', desc: 'e.g. 1-3, 5' },
                    { id: 'all', label: 'Burst Every Page', desc: 'Single pages in ZIP' },
                    { id: 'chunk', label: 'Split by Chunks', desc: 'Every N pages' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSplitMode(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        splitMode === m.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 hover:border-blue-200 border-slate-200/80'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className={`text-[10px] ${splitMode === m.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {splitMode === 'pages' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Page Numbers or Ranges (1-Indexed)
                  </label>
                  <input
                    type="text"
                    value={splitPages}
                    onChange={(e) => setSplitPages(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="w-full max-w-sm text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Use commas and hyphens: <code className="bg-white px-1.5 py-0.5 rounded border">1, 3-5, 8</code>
                  </span>
                </div>
              )}

              {splitMode === 'chunk' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Number of Pages per File
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={splitChunkSize}
                    onChange={(e) => setSplitChunkSize(parseInt(e.target.value) || 1)}
                    className="w-32 text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. WATERMARK PDF CONTROLS */}
          {activeTab === 'pdf_watermark' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full max-w-md text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                />
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {['CONFIDENTIAL', 'DRAFT', 'COPY', 'APPROVED', 'INTERNAL'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWatermarkText(preset)}
                      className="text-[10px] px-2 py-0.5 bg-white border border-blue-100 text-blue-700 rounded-md hover:bg-blue-50 font-semibold"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Opacity
                    </label>
                    <span className="text-xs font-bold text-blue-700">
                      {Math.round(watermarkOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Font Size Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Font Size
                    </label>
                    <span className="text-xs font-bold text-blue-700">
                      {watermarkFontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="80"
                    step="2"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Angle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Orientation Angle
                  </label>
                  <select
                    value={watermarkAngle}
                    onChange={(e) => setWatermarkAngle(parseInt(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="45">45° Diagonal (Standard)</option>
                    <option value="-45">-45° Reverse Diagonal</option>
                    <option value="0">0° Horizontal</option>
                    <option value="90">90° Vertical</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Watermark Color
                  </label>
                  <select
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="gray">Slate Gray</option>
                    <option value="red">Crimson Red</option>
                    <option value="blue">Royal Blue</option>
                    <option value="green">Forest Green</option>
                    <option value="black">Solid Black</option>
                  </select>
                </div>

                {/* Layering */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Layer Position
                  </label>
                  <select
                    value={watermarkOnTop ? 'top' : 'bottom'}
                    onChange={(e) => setWatermarkOnTop(e.target.value === 'top')}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="top">Foreground (Above text)</option>
                    <option value="bottom">Background (Behind text)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. ADD PAGE NUMBERS CONTROLS */}
          {activeTab === 'pdf_page_numbers' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Page Number Format
                  </label>
                  <select
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Page {page} of {total}">Page 1 of 10</option>
                    <option value="{page} / {total}">1 / 10</option>
                    <option value="Page {page}">Page 1</option>
                    <option value="- {page} -">- 1 -</option>
                    <option value="{page}">1 (Just Number)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Placement Position
                  </label>
                  <select
                    value={pageNumberPosition}
                    onChange={(e) => setPageNumberPosition(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="bottom_center">Bottom Center</option>
                    <option value="bottom_right">Bottom Right</option>
                    <option value="bottom_left">Bottom Left</option>
                    <option value="top_right">Top Right</option>
                    <option value="top_center">Top Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pageNumberStart}
                    onChange={(e) => setPageNumberStart(parseInt(e.target.value) || 1)}
                    className="w-32 text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Font Size
                    </label>
                    <span className="text-xs font-bold text-blue-700">
                      {pageNumberSize}pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    value={pageNumberSize}
                    onChange={(e) => setPageNumberSize(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. ROTATE PDF CONTROLS */}
          {activeTab === 'pdf_rotate' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Rotation Direction
                  </label>
                  <select
                    value={rotateAngle}
                    onChange={(e) => setRotateAngle(parseInt(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="90">90° Clockwise</option>
                    <option value="180">180° Invert / Flip</option>
                    <option value="270">270° Counter-Clockwise (90° Left)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Page Scope
                  </label>
                  <select
                    value={rotateScope}
                    onChange={(e) => setRotateScope(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Pages in Document</option>
                    <option value="odd">Odd Pages Only (1, 3, 5...)</option>
                    <option value="even">Even Pages Only (2, 4, 6...)</option>
                    <option value="custom">Specific Custom Pages</option>
                  </select>
                </div>
              </div>

              {rotateScope === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pages to Rotate (e.g. 1, 3-5)
                  </label>
                  <input
                    type="text"
                    value={rotatePages}
                    onChange={(e) => setRotatePages(e.target.value)}
                    placeholder="1, 3, 5"
                    className="w-full max-w-sm text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* 7. PROTECT PDF CONTROLS */}
          {activeTab === 'pdf_protect' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Document Open Password (AES-256)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password..."
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Permissions Restrictions
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prot_print"
                    checked={pdfAllowPrint}
                    onChange={(e) => setPdfAllowPrint(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="prot_print" className="text-xs text-slate-700 cursor-pointer font-medium">
                    Allow document printing
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prot_copy"
                    checked={pdfAllowCopy}
                    onChange={(e) => setPdfAllowCopy(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="prot_copy" className="text-xs text-slate-700 cursor-pointer font-medium">
                    Allow copying text and graphic contents
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 8. UNLOCK PDF CONTROLS */}
          {activeTab === 'pdf_unlock' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Enter Password to Decrypt
                </label>
                <div className="relative max-w-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter existing PDF password..."
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                This will authenticate and produce an unprotected, DRM-free version of the document.
              </p>
            </div>
          )}

          {/* 9. DELETE PAGES CONTROLS */}
          {activeTab === 'pdf_delete_pages' && (
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Pages to Remove (1-Indexed)
                </label>
                <input
                  type="text"
                  value={deletePagesInput}
                  onChange={(e) => setDeletePagesInput(e.target.value)}
                  placeholder="e.g. 2, 4-6"
                  className="w-full max-w-sm text-xs rounded-xl border border-rose-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 font-mono"
                />
                <span className="text-[11px] text-rose-700 mt-1 block">
                  Specified pages will be permanently deleted from the resulting document.
                </span>
              </div>
            </div>
          )}

          {/* 10. EXTRACT IMAGES CONTROLS */}
          {activeTab === 'pdf_extract_images' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Output Image Format
                  </label>
                  <select
                    value={extractFormat}
                    onChange={(e) => setExtractFormat(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="original">Original Embedded Format (JPEG/PNG)</option>
                    <option value="png">Convert All to PNG</option>
                    <option value="jpg">Convert All to JPEG</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Filter Minimum Dimension
                    </label>
                    <span className="text-xs font-bold text-blue-700">
                      {extractMinDim}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={extractMinDim}
                    onChange={(e) => setExtractMinDim(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Ignores decorative bullet points or spacer lines below this size.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 11. IMAGE OPTIMIZER CONTROLS */}
          {activeTab === 'image_optimize' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-5">
              {/* Quality Slider Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Compression Quality</span>
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {imageQuality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10% (Aggressive compression)</span>
                  <span>85% (Balanced)</span>
                  <span>100% (Maximum clarity)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Convert Target Format
                  </label>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="original">Keep Original Format</option>
                    <option value="webp">Convert to WebP (Google Modern Web)</option>
                    <option value="jpg">Convert to JPEG</option>
                    <option value="png">Convert to PNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Resize Option
                  </label>
                  <select
                    value={imageResizeMode}
                    onChange={(e) => setImageResizeMode(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="original">Original Dimensions (100%)</option>
                    <option value="scale">Scale by Percentage</option>
                    <option value="width">Custom Width (Preserve Aspect Ratio)</option>
                  </select>
                </div>
              </div>

              {imageResizeMode === 'scale' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Scale Percentage
                    </label>
                    <span className="text-xs font-bold text-blue-700">
                      {imageScalePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={imageScalePct}
                    onChange={(e) => setImageScalePct(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>
              )}

              {imageResizeMode === 'width' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Width (Pixels)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1920"
                    value={imageCustomWidth}
                    onChange={(e) => setImageCustomWidth(e.target.value)}
                    className="w-40 text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
                <input
                  type="checkbox"
                  id="img_strip"
                  checked={imageStripMetadata}
                  onChange={(e) => setImageStripMetadata(e.target.checked)}
                  className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                />
                <label htmlFor="img_strip" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Remove camera EXIF, GPS location, and device metadata
                </label>
              </div>
            </div>
          )}

          {/* 12. IMAGES TO PDF ALBUM CONTROLS */}
          {activeTab === 'image_to_pdf' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Album Filename
                </label>
                <input
                  type="text"
                  value={albumOutputName}
                  onChange={(e) => setAlbumOutputName(e.target.value)}
                  className="w-full max-w-sm text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <p className="text-xs text-slate-500">
                All uploaded photos will be combined into pages of a clean, high-resolution PDF album.
              </p>
            </div>
          )}

          {/* 13. SPREADSHEET SPLIT CONTROLS */}
          {activeTab === 'sheet_split' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Format for Individual Sheets
                </label>
                <select
                  value={sheetTargetExt}
                  onChange={(e) => setSheetTargetExt(e.target.value)}
                  className="w-full max-w-xs text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="xlsx">Separate Excel Workbooks (.xlsx)</option>
                  <option value="csv">Standard CSV Files (.csv)</option>
                </select>
              </div>
              <p className="text-xs text-slate-500">
                Every tab in your workbook will be extracted as an individual file and packaged into a ZIP archive.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Download Banner */}
          {downloadBlob && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Operation completed successfully! Ready to download.</span>
              </div>
              <button
                onClick={triggerDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save {downloadName}</span>
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>Processed strictly on your server • Temporary files cleared automatically</span>
            </div>

            <button
              onClick={runOperation}
              disabled={loading || (!singleFile && files.length === 0)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md ${
                loading || (!singleFile && files.length === 0)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
              <span>{loading ? "Executing Locally..." : "Execute Operation"}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
