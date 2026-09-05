"use client";

import React from "react";
import { SearchResponse } from "@/lib/semantic-search";
import { ProductCard } from "./ProductCard";
import {
  Compass,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Brain,
  ArrowRight,
  Flame,
} from "lucide-react";

interface SearchDiscoveryViewProps {
  response: SearchResponse;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  searchMode: "semantic" | "keyword";
}

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  response,
  isLoading,
  onSelectPrompt,
  searchMode,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-zinc-500">
          Embedding query & scanning product semantic catalog...
        </p>
      </div>
    );
  }

  // --- Edge Case 1: Empty Search Box ---
  if (response.status === "empty") {
    return (
      <div className="space-y-8 py-6">
        <div className="text-center max-w-lg mx-auto space-y-2 p-8 border border-dashed border-zinc-300 rounded-2xl bg-white/60">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-700">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900">
            Type what you&apos;re looking for.
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans">
            Search with everyday phrases, activity requirements, or environmental
            conditions. You don&apos;t need to guess catalog keywords.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onSelectPrompt("warm jacket for hiking in the rain")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-mono hover:bg-zinc-800 transition-all shadow-xs"
            >
              <span>Test Benchmark Query</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onSelectPrompt("shoes for standing all day in hospital")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-xs font-mono hover:bg-zinc-50 transition-all"
            >
              <span>Hospital Comfort Shoes</span>
            </button>
          </div>
        </div>

        {/* Popular Fallback Products */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-zinc-800" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                Popular Trail & Everyday Essentials
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Popular catalog essential"
                  score={90}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Edge Case 3: Gibberish or Nonsense Query ---
  if (response.status === "gibberish") {
    return (
      <div className="space-y-8 py-6">
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-3 max-w-xl mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">
              We couldn&apos;t understand that description
            </h3>
            <p className="text-xs text-amber-800/90 leading-relaxed font-sans">
              {response.message ||
                "Please try searching with everyday words like 'warm jacket for hiking in the rain' or 'comfortable sneakers'."}
            </p>
          </div>
          <div className="pt-1 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onSelectPrompt("warm jacket for hiking in the rain")}
              className="px-3 py-1.5 bg-amber-900 text-white rounded-md text-xs font-mono hover:bg-amber-800 transition-colors"
            >
              Try: &ldquo;warm jacket for hiking in the rain&rdquo;
            </button>
          </div>
        </div>

        {/* Fallback Popular Items */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-zinc-700" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                Curated Popular Items
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Catalog discovery pick"
                  score={85}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Edge Case 2: No Close Matches ---
  if (response.status === "no_close_matches") {
    return (
      <div className="space-y-8 py-6">
        <div className="p-6 rounded-2xl bg-zinc-100/70 border border-zinc-200 text-zinc-800 space-y-3 max-w-xl mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-300 flex items-center justify-center mx-auto text-zinc-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900">
              No close matches, try a different description
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              None of our products matched that specific description. Check your
              filters or try describing the material, purpose, or weather condition.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onSelectPrompt("warm jacket for hiking in the rain")}
              className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-mono hover:bg-zinc-800"
            >
              Reset to benchmark query
            </button>
          </div>
        </div>

        {/* Popular Fallback Items */}
        {response.fallbackProducts && response.fallbackProducts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-zinc-800" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
                Explore Popular Items Instead
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {response.fallbackProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rank={idx + 1}
                  whyMatched="Popular catalog item"
                  score={85}
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
    <div className="space-y-6">
      {/* Success Metrics & Comparison Banner */}
      {response.comparison && searchMode === "semantic" && (
        <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Success Metric • Semantic vs Plain Keyword Search
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {response.comparison.explanation}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0 pt-2 sm:pt-0 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-md bg-zinc-800 text-center">
              <span className="text-[10px] uppercase text-zinc-400 block">
                Semantic Recall
              </span>
              <span className="font-bold text-white">
                {response.comparison.semanticMatchCount} items
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-zinc-800/60 text-center text-zinc-400">
              <span className="text-[10px] uppercase text-zinc-500 block">
                Keyword Recall
              </span>
              <span className="font-bold">
                {response.comparison.keywordMatchCount} items
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pb-1 border-b border-zinc-200">
        <span>
          Showing {response.results.length} ranked matches for &ldquo;{response.query}&rdquo;
        </span>
        <span className="capitalize">
          Mode: <strong className="text-zinc-900">{searchMode}</strong>
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {response.results.map((item, idx) => (
          <ProductCard
            key={item.product.id}
            product={item.product}
            rank={idx + 1}
            whyMatched={item.whyMatched}
            score={item.score}
          />
        ))}
      </div>
    </div>
  );
};
