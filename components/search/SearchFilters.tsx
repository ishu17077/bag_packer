"use client";

import React from "react";
import { SearchFilters as FilterType } from "@/lib/semantic-search";
import { SlidersHorizontal, Brain, Type, RotateCcw } from "lucide-react";

interface SearchFiltersProps {
  filters: FilterType;
  setFilters: (f: FilterType) => void;
  searchMode: "semantic" | "keyword";
  setSearchMode: (m: "semantic" | "keyword") => void;
  totalResults: number;
}

const CATEGORIES = [
  "All",
  "Jackets & Outerwear",
  "Footwear",
  "Backpacks & Luggage",
  "Trail Equipment",
  "Activewear",
  "Accessories",
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  setFilters,
  searchMode,
  setSearchMode,
  totalResults,
}) => {
  const handleCategorySelect = (cat: string) => {
    setFilters({
      ...filters,
      category: cat === "All" ? undefined : cat,
    });
  };

  const handleReset = () => {
    setFilters({});
    setSearchMode("semantic");
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.inStockOnly;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
            Search Controls & Discovery Filters
          </h2>
          <span className="text-[11px] font-mono text-zinc-400">
            ({totalResults} items)
          </span>
        </div>

        {/* Search Mode Comparison Selector (Semantic vs Keyword) */}
        <div className="flex items-center space-x-1.5 p-1 bg-zinc-100 rounded-lg border border-zinc-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSearchMode("semantic")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
              searchMode === "semantic"
                ? "bg-zinc-900 text-white shadow-2xs font-medium"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            title="Semantic Search: Understands concepts, synonyms, and natural intent"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Semantic Search</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode("keyword")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
              searchMode === "keyword"
                ? "bg-zinc-900 text-white shadow-2xs font-medium"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            title="Plain Keyword Search: Strict literal word match"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Keyword Search</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Category
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected =
              (!filters.category && cat === "All") || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                  isSelected
                    ? "bg-zinc-900 border-zinc-900 text-white font-medium shadow-2xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Controls: Price, Rating, In-Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 text-xs font-mono">
        {/* Max Price */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
            Max Price: {filters.maxPrice ? `$${filters.maxPrice}` : "Any"}
          </label>
          <input
            type="range"
            min="30"
            max="300"
            step="10"
            value={filters.maxPrice ?? 300}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFilters({ ...filters, maxPrice: val === 300 ? undefined : val });
            }}
            className="w-full accent-zinc-900 cursor-pointer"
          />
        </div>

        {/* Min Rating */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
            Min Rating
          </label>
          <select
            value={filters.minRating ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                minRating: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            aria-label="Filter by minimum rating"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1 text-zinc-800 text-xs focus:outline-hidden"
          >
            <option value="">Any Rating</option>
            <option value="4.5">★ 4.5 & above</option>
            <option value="4.8">★ 4.8 & above</option>
          </select>
        </div>

        {/* In-Stock Toggle */}
        <div className="flex items-center sm:justify-end sm:pt-4">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(filters.inStockOnly)}
              onChange={(e) =>
                setFilters({ ...filters, inStockOnly: e.target.checked })
              }
              className="rounded border-zinc-300 accent-zinc-900 w-4 h-4 cursor-pointer"
            />
            <span className="text-zinc-700">In-Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );
};
