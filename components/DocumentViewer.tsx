"use client";

import React, { useState } from "react";
import { DetectedEntity, EntityType } from "@/lib/detector";
import { Copy, Check, Download, SplitSquareVertical } from "lucide-react";

interface DocumentViewerProps {
  originalText: string;
  redactedText: string;
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  fileName: string | null;
}

const ENTITY_BADGE_STYLES: Record<EntityType, { bg: string; text: string; border: string }> = {
  NAME: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300" },
  EMAIL: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-300" },
  PHONE: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-300" },
  ID_NUMBER: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-300" },
  CREDIT_CARD: { bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-300" },
  SECRET: { bg: "bg-red-50", text: "text-red-900", border: "border-red-300" },
  IP_ADDRESS: { bg: "bg-cyan-50", text: "text-cyan-900", border: "border-cyan-300" },
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  originalText,
  redactedText,
  entities,
  selectedEntityId,
  onSelectEntity,
  fileName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(redactedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([redactedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "document";
    link.href = url;
    link.download = `${baseName}.redacted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render original text with highlighted entities
  const renderHighlightedOriginal = () => {
    if (!originalText) return null;
    if (entities.length === 0) {
      return <span>{originalText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort entities ascending by start index
    const sorted = [...entities].sort((a, b) => a.startIndex - b.startIndex);

    sorted.forEach((ent) => {
      // Add plain text before entity
      if (ent.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{originalText.substring(lastIndex, ent.startIndex)}</span>
        );
      }

      const isSelected = selectedEntityId === ent.id;
      const style = ENTITY_BADGE_STYLES[ent.type] || {
        bg: "bg-zinc-100",
        text: "text-zinc-800",
        border: "border-zinc-300",
      };

      elements.push(
        <mark
          key={ent.id}
          onClick={() => onSelectEntity(isSelected ? null : ent.id)}
          className={`cursor-pointer inline-flex items-center rounded px-1.5 py-0.5 mx-0.5 font-mono text-[11px] font-semibold border transition-all ${
            style.bg
          } ${style.text} ${style.border} ${
            isSelected
              ? "ring-2 ring-zinc-900 shadow-xs scale-102"
              : "hover:ring-1 hover:ring-zinc-400"
          }`}
          title={`Click to inspect ${ent.type} (${Math.round(ent.confidence * 100)}% confidence)`}
        >
          <span>{ent.value}</span>
          <span className="ml-1 text-[9px] uppercase px-1 py-0.2 rounded bg-black/10 text-black/70">
            {ent.type}
          </span>
        </mark>
      );

      lastIndex = ent.endIndex;
    });

    // Add trailing text
    if (lastIndex < originalText.length) {
      elements.push(
        <span key={`text-tail`}>{originalText.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Bar */}
      <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <SplitSquareVertical className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
            Inspection Panel • Side-by-Side View
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            disabled={!redactedText}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white text-xs font-mono text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs disabled:opacity-40"
            title="Copy redacted text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Redacted</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!redactedText}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white text-xs font-mono text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs disabled:opacity-40"
            title="Download redacted text file"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 min-h-[320px]">
        {/* Left Column: Original */}
        <div className="p-4 sm:p-5 flex flex-col bg-white">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-100 text-xs font-mono">
            <span className="font-semibold text-zinc-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Original Document</span>
            </span>
            <span className="text-zinc-400 text-[11px]">
              {entities.length} detected entities
            </span>
          </div>

          <div className="flex-1 font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[420px] pr-2">
            {originalText ? (
              renderHighlightedOriginal()
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-zinc-400 text-xs italic">
                <span>No document loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Redacted */}
        <div className="p-4 sm:p-5 flex flex-col bg-zinc-50/30">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-100 text-xs font-mono">
            <span className="font-semibold text-zinc-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Redacted Result</span>
            </span>
            <span className="text-zinc-400 text-[11px]">Sanitized Output</span>
          </div>

          <div className="flex-1 font-mono text-xs text-zinc-900 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[420px] pr-2">
            {redactedText ? (
              <span>{redactedText}</span>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-zinc-400 text-xs italic">
                <span>Waiting for detection scan...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
