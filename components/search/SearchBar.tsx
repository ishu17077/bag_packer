"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q: string) => void;
  isLoading: boolean;
  groqConnected?: boolean;
}

export const SUGGESTED_QUERIES = [
  { label: "Spec Benchmark", text: "warm jacket for hiking in the rain" },
  { label: "Footwear", text: "shoes for standing all day in hospital" },
  { label: "Commute", text: "waterproof backpack for carrying laptop" },
  { label: "Camping", text: "lightweight tent for mountain backpacking" },
  { label: "Sub-Zero", text: "insulated parka for freezing snow" },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  groqConnected = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChipClick = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
          <Search className="w-5 h-5 sm:w-5 sm:h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you need in plain words (e.g. 'warm jacket for hiking in the rain')..."
          className="w-full pl-12 sm:pl-13 pr-28 sm:pr-32 py-4 bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl text-sm sm:text-base font-sans text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all duration-150"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center space-x-2">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onSearch("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white rounded-xl text-xs font-mono font-medium transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </>
            )}
          </button>

          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 border border-zinc-200 rounded-md">
            /
          </kbd>
        </div>
      </form>

      {/* Suggested Prompts & AI Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="flex items-center space-x-1 text-zinc-400 font-mono text-[11px] shrink-0 mr-0.5">
            <Sparkles className="w-3 h-3 text-zinc-500" />
            <span>Try:</span>
          </span>
          <div className="flex items-center space-x-1.5 shrink-0">
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq.text}
                type="button"
                onClick={() => handleChipClick(sq.text)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all truncate border ${
                  query === sq.text
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                    : "bg-white/80 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                }`}
                title={`Search: "${sq.text}"`}
              >
                <span className="opacity-50 text-[10px] mr-1">[{sq.label}]</span>
                {sq.text}
              </button>
            ))}
          </div>
        </div>

        {/* AI Backend Status Pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white text-[10px] font-mono text-zinc-600 border border-zinc-200 shrink-0 self-start sm:self-auto shadow-2xs">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              groqConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
            }`}
          />
          <span>
            LLM: {groqConnected ? "Llama-3.3-70B Active" : "Local Semantic Mode"}
          </span>
        </div>
      </div>
    </div>
  );
};
