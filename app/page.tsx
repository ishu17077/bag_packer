"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { RedactionSettings } from "@/components/RedactionSettings";
import { DocumentViewer } from "@/components/DocumentViewer";
import { EntityTable } from "@/components/EntityTable";
import { McpModal } from "@/components/McpModal";
import {
  detectSensitiveData,
  DEFAULT_CONFIG,
  RedactionConfig,
  DetectedEntity,
  EntityType,
} from "@/lib/detector";
import { FolderOpen } from "lucide-react";
import { SYNTHETIC_SAMPLES } from "@/lib/synthetic-data";

export default function Home() {
  // Initial detection computation for the default benchmark sample
  const initialResult = useMemo(
    () => detectSensitiveData(SYNTHETIC_SAMPLES[0].content, DEFAULT_CONFIG),
    []
  );

  // Input state
  const [inputText, setInputText] = useState<string>(
    SYNTHETIC_SAMPLES[0].content // Initialized with Problem Statement sample
  );
  const [fileName, setFileName] = useState<string | null>("sample-problem-statement.txt");

  // Configuration state
  const [config, setConfig] = useState<RedactionConfig>(DEFAULT_CONFIG);

  // Scan & Result state initialized directly without cascading renders
  const [entities, setEntities] = useState<DetectedEntity[]>(initialResult.entities);
  const [redactedText, setRedactedText] = useState<string>(initialResult.redactedText);
  const [summaryReport, setSummaryReport] = useState<string>(initialResult.summaryReport);
  const [counts, setCounts] = useState<Record<EntityType, number>>(initialResult.counts);
  const [hasScanned, setHasScanned] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanDurationMs, setScanDurationMs] = useState<number>(0.5);

  // Interaction & Modal state
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emptyUploadPrompt, setEmptyUploadPrompt] = useState<boolean>(false);
  const [isMcpOpen, setIsMcpOpen] = useState<boolean>(false);

  // Core scan runner
  const runDetection = useCallback((textToScan: string, currentConfig: RedactionConfig) => {
    if (!textToScan || textToScan.trim() === "") {
      setEmptyUploadPrompt(true);
      setEntities([]);
      setRedactedText("");
      setSummaryReport("");
      setHasScanned(false);
      return;
    }

    setEmptyUploadPrompt(false);
    setIsScanning(true);

    setTimeout(() => {
      const startTime = performance.now();
      const result = detectSensitiveData(textToScan, currentConfig);
      const duration = Math.round((performance.now() - startTime) * 100) / 100;

      setEntities(result.entities);
      setRedactedText(result.redactedText);
      setSummaryReport(result.summaryReport);
      setCounts(result.counts);
      setScanDurationMs(duration);
      setHasScanned(true);
      setIsScanning(false);
    }, 50);
  }, []);

  // Re-run scan when configuration changes
  const handleConfigChange = (newConfig: RedactionConfig) => {
    setConfig(newConfig);
    if (inputText.trim()) {
      runDetection(inputText, newConfig);
    }
  };

  // Toggle individual entity redaction on/off
  const handleToggleEntity = (entityId: string) => {
    const updated = entities.map((ent) => {
      if (ent.id === entityId) {
        return { ...ent, enabled: !ent.enabled };
      }
      return ent;
    });

    // Reconstruct redacted text with updated entity states
    let newRedacted = inputText;
    const reversed = [...updated].sort((a, b) => b.startIndex - a.startIndex);
    for (const ent of reversed) {
      if (ent.enabled) {
        newRedacted =
          newRedacted.substring(0, ent.startIndex) +
          ent.redactedValue +
          newRedacted.substring(ent.endIndex);
      }
    }

    setEntities(updated);
    setRedactedText(newRedacted);
  };

  // Trigger manual scan
  const handleManualScan = () => {
    if (!inputText || inputText.trim() === "") {
      setEmptyUploadPrompt(true);
      return;
    }
    setEmptyUploadPrompt(false);
    runDetection(inputText, config);
  };

  // Calculate average confidence score
  const avgConfidence = useMemo(() => {
    if (entities.length === 0) return 0;
    const sum = entities.reduce((acc, curr) => acc + curr.confidence, 0);
    return Math.round((sum / entities.length) * 100);
  }, [entities]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900">
      {/* Header */}
      <Header onOpenMcp={() => setIsMcpOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Intro / Problem Statement Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Use Case 3
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-mono text-zinc-700 font-medium">
                Sensitive Data Detection & Redaction Engine
              </span>
            </div>
            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
              Scans documents to find sensitive personal information (names, emails, phone numbers, ID cards, secrets) and masks or removes it with full audit reporting and context-aware NER heuristics.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-zinc-100 pt-3 md:pt-0 md:pl-6 text-center">
            <div className="px-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Entities
              </span>
              <span className="text-base font-mono font-bold text-zinc-900">
                {entities.length}
              </span>
            </div>
            <div className="px-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Avg Conf
              </span>
              <span className="text-base font-mono font-bold text-zinc-900">
                {entities.length > 0 ? `${avgConfidence}%` : "—"}
              </span>
            </div>
            <div className="px-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Latency
              </span>
              <span className="text-base font-mono font-bold text-zinc-900">
                {scanDurationMs ? `${scanDurationMs}ms` : "<1ms"}
              </span>
            </div>
          </div>
        </div>

        {/* Edge Case 1: No file uploaded prompt */}
        {emptyUploadPrompt && (
          <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <FolderOpen className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-semibold block">No document or file uploaded</span>
                <span className="text-amber-800">
                  Please upload a text file (.txt, .md, .csv, .json, .log) or paste text into the input box to perform detection.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const s = SYNTHETIC_SAMPLES[0];
                setInputText(s.content);
                setFileName(`synthetic-${s.id}.txt`);
                setEmptyUploadPrompt(false);
                runDetection(s.content, config);
              }}
              className="px-3 py-1 bg-amber-900 text-white rounded text-xs font-mono shrink-0 hover:bg-amber-800"
            >
              Load Sample Spec
            </button>
          </div>
        )}

        {/* Input & Upload Zone */}
        <UploadZone
          inputText={inputText}
          setInputText={(text) => {
            setInputText(text);
            if (emptyUploadPrompt) setEmptyUploadPrompt(false);
          }}
          fileName={fileName}
          setFileName={setFileName}
          onScan={handleManualScan}
          isScanning={isScanning}
          validationError={validationError}
          setValidationError={setValidationError}
        />

        {/* Configuration Bar */}
        <RedactionSettings
          config={config}
          onChange={handleConfigChange}
          entityCounts={counts}
        />

        {/* Document Viewer (Side-by-Side) */}
        <DocumentViewer
          originalText={inputText}
          redactedText={redactedText}
          entities={entities}
          selectedEntityId={selectedEntityId}
          onSelectEntity={setSelectedEntityId}
          fileName={fileName}
        />

        {/* Entity Table & Inspection Report */}
        <EntityTable
          entities={entities}
          summaryReport={summaryReport}
          counts={counts}
          selectedEntityId={selectedEntityId}
          onSelectEntity={setSelectedEntityId}
          onToggleEntity={handleToggleEntity}
          hasScanned={hasScanned}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sensitive Data Detection & Redaction Engine • Use Case 3</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMcpOpen(true)}
              className="hover:text-zinc-900 underline underline-offset-4"
            >
              Expose as MCP Tool
            </button>
            <span>•</span>
            <a
              href="/synthetic_samples/sample_benchmark.txt"
              target="_blank"
              download
              className="hover:text-zinc-900 underline underline-offset-4"
            >
              Download Benchmark File
            </a>
          </div>
        </div>
      </footer>

      {/* MCP Tool Modal */}
      <McpModal isOpen={isMcpOpen} onClose={() => setIsMcpOpen(false)} />
    </div>
  );
}
