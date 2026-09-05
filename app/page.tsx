"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Header, ActiveTab } from "@/components/Header";

// Use Case 4: Semantic Search Components
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchDiscoveryView } from "@/components/search/SearchDiscoveryView";
import { McpSearchModal } from "@/components/search/McpSearchModal";
import {
  searchProducts,
  SearchResponse,
  SearchFilters as FilterType,
} from "@/lib/semantic-search";

// Use Case 3: Sensitive Data Redaction Components
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
import { SYNTHETIC_SAMPLES } from "@/lib/synthetic-data";
import { FolderOpen } from "lucide-react";

export default function Home() {
  // Navigation: "search" (Use Case 4 - Default) or "redact" (Use Case 3)
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");

  // -------------------------------------------------------------
  // USE CASE 4 STATE: Natural Language Product Search & Discovery
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>(
    "warm jacket for hiking in the rain" // Initialized with spec benchmark
  );
  const [filters, setFilters] = useState<FilterType>({});
  const [searchMode, setSearchMode] = useState<"semantic" | "keyword">("semantic");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchMcpOpen, setIsSearchMcpOpen] = useState<boolean>(false);

  // Compute initial search result directly for the benchmark sample
  const initialSearchResponse = useMemo(
    () => searchProducts("warm jacket for hiking in the rain", {}, "semantic"),
    []
  );
  const [searchResponse, setSearchResponse] = useState<SearchResponse>(initialSearchResponse);

  const handleExecuteSearch = useCallback(
    (queryToSearch: string, activeFilters = filters, currentMode = searchMode) => {
      setIsSearching(true);
      setTimeout(() => {
        const resp = searchProducts(queryToSearch, activeFilters, currentMode);
        setSearchResponse(resp);
        setIsSearching(false);
      }, 60);
    },
    [filters, searchMode]
  );

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    handleExecuteSearch(searchQuery, newFilters, searchMode);
  };

  const handleModeChange = (newMode: "semantic" | "keyword") => {
    setSearchMode(newMode);
    handleExecuteSearch(searchQuery, filters, newMode);
  };

  // -------------------------------------------------------------
  // USE CASE 3 STATE: Sensitive Data Detection & Redaction Engine
  // -------------------------------------------------------------
  const initialRedactResult = useMemo(
    () => detectSensitiveData(SYNTHETIC_SAMPLES[0].content, DEFAULT_CONFIG),
    []
  );
  const [inputText, setInputText] = useState<string>(SYNTHETIC_SAMPLES[0].content);
  const [fileName, setFileName] = useState<string | null>("sample-problem-statement.txt");
  const [redactConfig, setRedactConfig] = useState<RedactionConfig>(DEFAULT_CONFIG);
  const [entities, setEntities] = useState<DetectedEntity[]>(initialRedactResult.entities);
  const [redactedText, setRedactedText] = useState<string>(initialRedactResult.redactedText);
  const [summaryReport, setSummaryReport] = useState<string>(initialRedactResult.summaryReport);
  const [counts, setCounts] = useState<Record<EntityType, number>>(initialRedactResult.counts);
  const [hasScanned, setHasScanned] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emptyUploadPrompt, setEmptyUploadPrompt] = useState<boolean>(false);
  const [isRedactMcpOpen, setIsRedactMcpOpen] = useState<boolean>(false);

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
      const result = detectSensitiveData(textToScan, currentConfig);
      setEntities(result.entities);
      setRedactedText(result.redactedText);
      setSummaryReport(result.summaryReport);
      setCounts(result.counts);
      setHasScanned(true);
      setIsScanning(false);
    }, 50);
  }, []);

  const handleConfigChange = (newConfig: RedactionConfig) => {
    setRedactConfig(newConfig);
    if (inputText.trim()) {
      runDetection(inputText, newConfig);
    }
  };

  const handleToggleEntity = (entityId: string) => {
    const updated = entities.map((ent) => {
      if (ent.id === entityId) {
        return { ...ent, enabled: !ent.enabled };
      }
      return ent;
    });

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

  const handleManualScan = () => {
    if (!inputText || inputText.trim() === "") {
      setEmptyUploadPrompt(true);
      return;
    }
    setEmptyUploadPrompt(false);
    runDetection(inputText, redactConfig);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900">
      {/* Universal Header with Navigation Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMcp={() => {
          if (activeTab === "search") setIsSearchMcpOpen(true);
          else setIsRedactMcpOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === "search" ? (
          /* ========================================================= */
          /* USE CASE 4: Natural Language Product Search & Discovery   */
          /* ========================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-zinc-200 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    Use Case 4
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs font-mono text-zinc-700 font-medium">
                    Natural Language Product Search & Discovery
                  </span>
                </div>
                <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
                  Type everyday descriptions (e.g. <em>&ldquo;a warm jacket for hiking in the rain&rdquo;</em>). The engine maps intents to product features and generates one-line relevance explanations (&ldquo;Matches: waterproof, insulated, outdoor use&rdquo;).
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-center">
                  <span className="text-[10px] uppercase text-zinc-400 block">Catalog</span>
                  <span className="font-bold text-zinc-900">23+ Items</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-center">
                  <span className="text-[10px] uppercase text-zinc-400 block">API Route</span>
                  <span className="font-bold text-zinc-900">/api/search</span>
                </div>
              </div>
            </div>

            {/* Search Bar with Autosuggest */}
            <SearchBar
              query={searchQuery}
              setQuery={setSearchQuery}
              onSearch={(q) => handleExecuteSearch(q, filters, searchMode)}
              isLoading={isSearching}
            />

            {/* Discovery Filters & Semantic Mode Toggle */}
            <SearchFilters
              filters={filters}
              setFilters={handleFilterChange}
              searchMode={searchMode}
              setSearchMode={handleModeChange}
              totalResults={searchResponse.results.length}
            />

            {/* Results Grid & Edge Case Fallbacks */}
            <SearchDiscoveryView
              response={searchResponse}
              isLoading={isSearching}
              onSelectPrompt={(prompt) => {
                setSearchQuery(prompt);
                handleExecuteSearch(prompt, filters, searchMode);
              }}
              searchMode={searchMode}
            />
          </div>
        ) : (
          /* ========================================================= */
          /* USE CASE 3: Sensitive Data Detection & Redaction Engine   */
          /* ========================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner */}
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
                  Scans documents for personal information (names, emails, phone numbers, ID cards) and masks or removes it with full audit reporting and context-aware heuristics.
                </p>
              </div>

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
                    Mode
                  </span>
                  <span className="text-base font-mono font-bold text-zinc-900 capitalize">
                    {redactConfig.style}
                  </span>
                </div>
                <div className="px-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    API Route
                  </span>
                  <span className="text-base font-mono font-bold text-zinc-900">
                    /api/redact
                  </span>
                </div>
              </div>
            </div>

            {/* Empty Upload Prompt Notice */}
            {emptyUploadPrompt && (
              <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <FolderOpen className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-semibold block">No document or file uploaded</span>
                    <span>Please upload a text file or paste text to perform detection.</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const s = SYNTHETIC_SAMPLES[0];
                    setInputText(s.content);
                    setFileName(`synthetic-${s.id}.txt`);
                    setEmptyUploadPrompt(false);
                    runDetection(s.content, redactConfig);
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

            {/* Redaction Settings */}
            <RedactionSettings
              config={redactConfig}
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

            {/* Entity Breakdown Table */}
            <EntityTable
              entities={entities}
              summaryReport={summaryReport}
              counts={counts}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              onToggleEntity={handleToggleEntity}
              hasScanned={hasScanned}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TCS Hackathon Showcase • Use Case 4 & Use Case 3</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (activeTab === "search") setIsSearchMcpOpen(true);
                else setIsRedactMcpOpen(true);
              }}
              className="hover:text-zinc-900 underline underline-offset-4"
            >
              MCP Tool Schema
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab(activeTab === "search" ? "redact" : "search")}
              className="hover:text-zinc-900 underline underline-offset-4"
            >
              Switch to {activeTab === "search" ? "Use Case 3 (Redaction)" : "Use Case 4 (Search)"}
            </button>
          </div>
        </div>
      </footer>

      {/* MCP Modals */}
      <McpSearchModal isOpen={isSearchMcpOpen} onClose={() => setIsSearchMcpOpen(false)} />
      <McpModal isOpen={isRedactMcpOpen} onClose={() => setIsRedactMcpOpen(false)} />
    </div>
  );
}
