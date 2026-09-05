"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Sparkles, CornerDownLeft } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q: string) => void;
  isLoading: boolean;
}

export const SUGGESTED_QUERIES = [
  { label: "Spec Benchmark", text: "warm jacket for hiking in the rain" },
  { label: "Footwear Intent", text: "shoes for standing all day in hospital" },
  { label: "Commuter Intent", text: "waterproof backpack for carrying laptop" },
  { label: "Camping Intent", text: "lightweight tent for mountain backpacking" },
  { label: "Edge Case: Gibberish", text: "asdfghjkl zzzzz" },
  { label: "Edge Case: No Matches", text: "quantum propulsion thruster" },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
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
    <div className="w-full space-y-3">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you need in plain English (e.g. 'a warm jacket for hiking in the rain')..."
          className="w-full pl-12 pr-28 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm font-sans text-zinc-900 placeholder:text-zinc-400 shadow-xs hover:border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onSearch("");
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white rounded-lg text-xs font-medium transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Search</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-400" />
              </>
            )}
          </button>

          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 border border-zinc-200 rounded">
            /
          </kbd>
        </div>
      </form>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="flex items-center space-x-1 text-zinc-400 font-mono text-[11px] shrink-0">
          <Sparkles className="w-3 h-3 text-zinc-500" />
          <span>Try:</span>
        </span>
        <div className="flex items-center space-x-1.5 shrink-0">
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq.text}
              type="button"
              onClick={() => handleChipClick(sq.text)}
              className="px-2.5 py-1 rounded-md bg-zinc-100/80 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-mono transition-all truncate max-w-[280px]"
              title={`Search: "${sq.text}"`}
            >
              <span className="text-zinc-400 text-[10px] mr-1">[{sq.label}]</span>
              {sq.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
