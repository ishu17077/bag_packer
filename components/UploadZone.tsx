"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Sparkles, X, CheckCircle2 } from "lucide-react";
import { SYNTHETIC_SAMPLES, SyntheticSample } from "@/lib/synthetic-data";

interface UploadZoneProps {
  inputText: string;
  setInputText: (text: string) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  onScan: () => void;
  isScanning: boolean;
  validationError: string | null;
  setValidationError: (err: string | null) => void;
}

const SUPPORTED_EXTENSIONS = [".txt", ".csv", ".json", ".md", ".log", ".tsv", ".text"];

export const UploadZone: React.FC<UploadZoneProps> = ({
  inputText,
  setInputText,
  fileName,
  setFileName,
  onScan,
  isScanning,
  validationError,
  setValidationError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    setValidationError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `Unsupported file type "${ext || "unknown"}". Please upload a plain text file (.txt, .md, .csv, .json, .log).`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setValidationError("Failed to read file content. Please try again.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (sample: SyntheticSample) => {
    setValidationError(null);
    setInputText(sample.content);
    setFileName(`synthetic-${sample.id}.txt`);
  };

  const handleClear = () => {
    setInputText("");
    setFileName(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
            Input Document / Text
          </h2>
          {fileName && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
              {fileName}
            </span>
          )}
        </div>

        {/* 1-Click Synthetic Sample Picker */}
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 hidden sm:inline">Load Sample:</span>
          <select
            aria-label="Load synthetic benchmark sample"
            onChange={(e) => {
              const s = SYNTHETIC_SAMPLES.find((item) => item.id === e.target.value);
              if (s) handleSampleSelect(s);
            }}
            defaultValue=""
            className="text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1 text-zinc-800 hover:border-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
          >
            <option value="" disabled>
              Select benchmark dataset...
            </option>
            {SYNTHETIC_SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.category}: {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation / Error banner for unsupported type */}
      {validationError && (
        <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-red-50/80 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold block">File Validation Notice</span>
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-red-500 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop or Text Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border rounded-lg transition-all ${
          isDragging
            ? "border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900/10"
            : "border-zinc-200 bg-zinc-50/30 hover:border-zinc-300"
        }`}
      >
        <textarea
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Paste sensitive text here, or drag & drop a file (.txt, .md, .csv, .json, .log)...&#10;&#10;e.g. 'Contact John Mehta at john.mehta@email.com or 9876543210 for details.'"
          rows={5}
          className="w-full bg-transparent p-4 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden resize-y leading-relaxed"
        />

        {/* Dropzone hint overlay when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none rounded-lg">
            <Upload className="w-6 h-6 text-zinc-800 mb-1 animate-bounce" />
            <span className="text-xs font-mono font-medium text-zinc-800">
              Drop text file to load contents
            </span>
          </div>
        )}
      </div>

      {/* Bottom action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            accept=".txt,.csv,.json,.md,.log,.tsv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white text-xs font-mono text-zinc-700 hover:bg-zinc-50 transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Upload File</span>
          </button>

          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-transparent hover:border-zinc-200 text-xs font-mono text-zinc-500 hover:text-zinc-800 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <span className="text-[11px] font-mono text-zinc-400 pl-1">
            {inputText.length} chars • {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
          </span>
        </div>

        <button
          type="button"
          onClick={onScan}
          disabled={isScanning}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white text-xs font-mono font-medium transition-all shadow-xs disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning Document...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Detect & Redact PII</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
