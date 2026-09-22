import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Presentation,
  BookOpen,
  ScanLine,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function ConversionMatrix({
  registry,
  selectedCategory,
  onSelectCategory,
  inputExt,
  targetFormat,
  onSelectTargetFormat,
  options,
  onOptionsChange,
  onPreviewSpreadsheet
}) {
  const [showOptions, setShowOptions] = useState(false);

  if (!registry || !registry.categories) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Loading supported formats from local engine...
      </div>
    );
  }

  const categoryIcons = {
    pdf: <FileText className="w-4 h-4" />,
    word: <FileText className="w-4 h-4" />,
    spreadsheets: <FileSpreadsheet className="w-4 h-4" />,
    presentations: <Presentation className="w-4 h-4" />,
    images: <ImageIcon className="w-4 h-4" />,
    text: <Layers className="w-4 h-4" />,
    ebook: <BookOpen className="w-4 h-4" />,
    ocr: <ScanLine className="w-4 h-4" />
  };

  const currentCategoryData = registry.categories[selectedCategory] || Object.values(registry.categories)[0];

  let availableTargetConversions = [];
  if (inputExt) {
    for (const cat of Object.values(registry.categories)) {
      for (const conv of cat.conversions) {
        if (conv.input_format.toLowerCase() === inputExt.toLowerCase()) {
          availableTargetConversions.push(conv);
        }
      }
    }
  } else {
    availableTargetConversions = currentCategoryData.conversions;
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {Object.entries(registry.categories).map(([catKey, catData]) => {
          const isActive = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200'
              }`}
            >
              {categoryIcons[catKey] || <FileText className="w-4 h-4" />}
              <span>{catData.name}</span>
            </button>
          );
        })}
      </div>

      {/* Target Format Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-slate-900">
            {inputExt ? `Convert .${inputExt} to:` : `Supported Conversions (${currentCategoryData.name})`}
          </label>
          {inputExt && ['xlsx', 'xls', 'csv', 'ods'].includes(inputExt) && (
            <button
              type="button"
              onClick={onPreviewSpreadsheet}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Data</span>
            </button>
          )}
        </div>

        {availableTargetConversions.length === 0 ? (
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
            No direct conversions available for .{inputExt}. Check the Utilities tab for additional operations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTargetConversions.map((conv) => {
              const isSelected = targetFormat === conv.output_format;
              const isAvailable = conv.is_available;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (isAvailable) onSelectTargetFormat(conv.output_format);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    !isAvailable
                      ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-slate-200/90 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className={`uppercase text-xs font-mono px-2 py-0.5 rounded-md border ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {conv.output_format}
                      </span>
                      <span>{conv.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs"></span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
                    {conv.description}
                  </p>

                  {!isAvailable && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                      <span>{conv.requires_libreoffice ? "Requires LibreOffice" : "Requires Tesseract"}</span>
                    </div>
                  )}

                  {conv.limitations && (
                    <div className="mt-2 text-[11px] text-slate-400 italic">
                      * {conv.limitations}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Options Accordion */}
      {targetFormat && (
        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Fine-Tune Conversion Settings (Optional)</span>
            </div>
            <span className="text-blue-600 text-xs font-semibold">
              {showOptions ? "Hide Options" : "Show Options"}
            </span>
          </button>

          {showOptions && (
            <div className="mt-4 pt-3 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {['jpg', 'jpeg', 'webp'].includes(targetFormat) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Quality ({options.quality || 90}%)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={options.quality || 90}
                    onChange={(e) => onOptionsChange({ ...options, quality: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              )}

              {['png', 'jpg', 'jpeg', 'pdf'].includes(targetFormat) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Resolution (DPI)
                  </label>
                  <select
                    value={options.dpi || 150}
                    onChange={(e) => onOptionsChange({ ...options, dpi: parseInt(e.target.value) })}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="96">96 DPI (Standard Web)</option>
                    <option value="150">150 DPI (Balanced)</option>
                    <option value="300">300 DPI (High-Res Print)</option>
                  </select>
                </div>
              )}

              {selectedCategory === 'ocr' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    OCR Language Recognition
                  </label>
                  <select
                    value={options.language || 'eng'}
                    onChange={(e) => onOptionsChange({ ...options, language: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="eng">English (eng)</option>
                    <option value="tam">Tamil (tam)</option>
                    <option value="eng+tam">English + Tamil</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="strip_metadata"
                  checked={options.strip_metadata || false}
                  onChange={(e) => onOptionsChange({ ...options, strip_metadata: e.target.checked })}
                  className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                />
                <label htmlFor="strip_metadata" className="text-xs font-medium text-slate-600 cursor-pointer">
                  Strip EXIF &amp; private metadata for enhanced privacy
                </label>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
