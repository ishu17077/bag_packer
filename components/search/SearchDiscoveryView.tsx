"use client";

import React, { useState, useMemo } from "react";
import { SearchResponse } from "@/lib/semantic-search";
import { ProductCard } from "./ProductCard";
import { Product } from "@/lib/products-data";
import {
  Compass,
  AlertTriangle,
  HelpCircle,
  Brain,
  ArrowRight,
  Flame,
  ArrowDownUp,
  SlidersHorizontal,
} from "lucide-react";

interface SearchDiscoveryViewProps {
  response: SearchResponse;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  searchMode: "semantic" | "keyword";
  onQuickView?: (product: Product, whyMatched: string, score: number) => void;
  onAddToCart?: (product: Product) => void;
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

const CATEGORIES = [
  "All",
  "Jackets & Outerwear",
  "Footwear",
  "Backpacks & Luggage",
  "Trail Equipment",
  "Activewear",
  "Accessories",
];

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  response,
  isLoading,
  onSelectPrompt,
  searchMode,
  onQuickView,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Filter and sort items dynamically on the client
  const processedResults = useMemo(() => {
    let items = [...response.results];

    if (selectedCategory !== "All") {
      items = items.filter((item) => item.product.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => a.product.price - b.product.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.product.price - a.product.price);
        break;
      case "rating":
        items.sort((a, b) => b.product.rating - a.product.rating);
        break;
      case "relevance":
      default:
        items.sort((a, b) => b.score - a.score);
        break;
    }

    return items;
  }, [response.results, selectedCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-900">
            Scanning semantic catalog...
          </p>
          <p className="text-xs font-mono text-zinc-400">
            Mapping natural language intent to product features & explanations
          </p>
        </div>
      </div>
    );
  }

  // --- Edge Case 1: Empty Query ---
  if (response.status === "empty") {
    return (
      <div className="space-y-10 py-6 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto space-y-3 p-8 border border-dashed border-zinc-200 rounded-3xl bg-white/70 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-800 shadow-2xs">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-900">
              Search by intent, activity, or weather
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Describe conditions like &ldquo;warm jacket for hiking in the rain&rdquo; or requirements like &ldquo;shoes for standing all day&rdquo;. No need to guess exact keywords.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onSelectPrompt("warm jacket for hiking in the rain")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-mono hover:bg-zinc-800 transition-all shadow-xs"
            >
              <span>Test Benchmark Query</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onSelectPrompt("shoes for standing all day in hospital")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-xs font-mono hover:bg-zinc-50 transition-all shadow-2xs"
            >
              <span>Hospital Comfort Shoes</span>
            </button>
          </div>
        </div>

        {/* Popular Catalog Essentials */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                  Featured Trail & Everyday Essentials
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Top rated picks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Popular catalog essential"
                  score={95}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Edge Case 2: Gibberish Query ---
  if (response.status === "gibberish") {
    return (
      <div className="space-y-10 py-6 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-3 max-w-xl mx-auto text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">
              We couldn&apos;t understand that description
            </h3>
            <p className="text-xs text-amber-800/90 leading-relaxed font-sans">
              {response.message ||
                "Please try searching with everyday words like 'warm jacket for hiking in the rain' or 'waterproof backpack'."}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onSelectPrompt("warm jacket for hiking in the rain")}
              className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-mono hover:bg-amber-800 transition-colors shadow-xs"
            >
              Try Benchmark: &ldquo;warm jacket for hiking in the rain&rdquo;
            </button>
          </div>
        </div>

        {/* Fallback Popular Items */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                Popular Catalog Recommendations
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Catalog discovery pick"
                  score={88}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Edge Case 3: No Close Matches ---
  if (response.status === "no_close_matches" || processedResults.length === 0) {
    return (
      <div className="space-y-10 py-6 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-zinc-100/80 border border-zinc-200 text-zinc-800 space-y-3 max-w-xl mx-auto text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-700 shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-900">
              No close matches found
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              None of our products matched that specific description. Try describing materials, activities, or environmental conditions.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                onSelectPrompt("warm jacket for hiking in the rain");
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-mono hover:bg-zinc-800 shadow-xs"
            >
              Reset to benchmark query
            </button>
          </div>
        </div>

        {/* Fallback Popular Items */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                Explore Popular Items Instead
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Popular catalog item"
                  score={85}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Active Results View ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Success Metric Explanation Banner */}
      {response.comparison && searchMode === "semantic" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-300">
                Semantic Recall Benchmark
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {response.comparison.explanation}
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700/80 text-center">
              <span className="text-[10px] uppercase text-zinc-400 block">
                Semantic Recall
              </span>
              <span className="font-bold text-white text-sm">
                {response.comparison.semanticMatchCount} items
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-center text-zinc-400">
              <span className="text-[10px] uppercase text-zinc-500 block">
                Keyword Recall
              </span>
              <span className="font-bold text-sm">
                {response.comparison.keywordMatchCount} items
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sorting Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 border ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs font-medium"
                  : "bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Counter & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs font-mono text-zinc-600">
          <span>
            <strong className="text-zinc-900">{processedResults.length}</strong> matches
          </span>
          <span className="text-zinc-300">•</span>
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200 shadow-2xs">
            <ArrowDownUp className="w-3 h-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none text-xs font-mono text-zinc-800 focus:outline-hidden cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {processedResults.map((item, idx) => (
          <ProductCard
            key={item.product.id}
            product={item.product}
            rank={idx + 1}
            whyMatched={item.whyMatched}
            score={item.score}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};
