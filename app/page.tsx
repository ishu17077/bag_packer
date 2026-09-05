"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sparkles, Check } from "lucide-react";

// Use Case 4: Semantic Search Components
import { SearchBar } from "@/components/search/SearchBar";
import { SearchDiscoveryView } from "@/components/search/SearchDiscoveryView";
import { ConnectMcpModal } from "@/components/search/ConnectMcpModal";
import { ProductQuickViewModal } from "@/components/search/ProductQuickViewModal";
import { Product } from "@/lib/products-data";
import {
  searchProducts,
  SearchResponse,
} from "@/lib/semantic-search";

export default function Home() {
  // -------------------------------------------------------------
  // Natural Language Product Search & Discovery State
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>(
    "warm jacket for hiking in the rain" // Initialized with spec benchmark
  );
  const [searchMode] = useState<"semantic" | "keyword">("semantic");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Compute initial search results for benchmark query
  const initialSearchResponse = useMemo(
    () => searchProducts("warm jacket for hiking in the rain", {}, "semantic"),
    []
  );
  const [searchResponse, setSearchResponse] = useState<SearchResponse>(initialSearchResponse);

  // -------------------------------------------------------------
  // MCP Connection State
  // -------------------------------------------------------------
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [isMcpConnected, setIsMcpConnected] = useState<boolean>(true);
  const [mcpServerUrl, setMcpServerUrl] = useState<string>("http://localhost:3000/api/mcp");

  // -------------------------------------------------------------
  // Quick View & Shopping Bag State
  // -------------------------------------------------------------
  const [quickViewItem, setQuickViewItem] = useState<{
    product: Product;
    whyMatched: string;
    score: number;
  } | null>(null);

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExecuteSearch = useCallback(
    (queryToSearch: string) => {
      setIsSearching(true);
      setTimeout(() => {
        const resp = searchProducts(queryToSearch, {}, searchMode);
        setSearchResponse(resp);
        setIsSearching(false);
      }, 50);
    },
    [searchMode]
  );

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems((prev) => [...prev, product]);
    setToastMessage(`Added "${product.title}" to your bag`);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleOpenQuickView = (product: Product, whyMatched: string, score: number) => {
    setQuickViewItem({ product, whyMatched, score });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Header with Connect MCP option and Bag Counter */}
      <Header
        onOpenMcp={() => setIsMcpModalOpen(true)}
        isMcpConnected={isMcpConnected}
        cartCount={cartItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Centered Hero Search Section */}
        <section className="text-center space-y-6 pt-2 sm:pt-4">
          <div className="space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-mono shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Semantic Search & Discovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Describe what you need in plain words.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
              Search by environmental conditions, activity intents, or materials. The engine maps your query to product attributes with one-line match explanations.
            </p>
          </div>

          {/* Prominent Search Bar */}
          <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            onSearch={handleExecuteSearch}
            isLoading={isSearching}
            groqConnected={searchResponse.groqConnected}
          />
        </section>

        {/* Product Results & Discovery View */}
        <section className="animate-in fade-in duration-200">
          <SearchDiscoveryView
            response={searchResponse}
            isLoading={isSearching}
            onSelectPrompt={(prompt) => {
              setSearchQuery(prompt);
              handleExecuteSearch(prompt);
            }}
            searchMode={searchMode}
            onQuickView={handleOpenQuickView}
            onAddToCart={handleAddToCart}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center space-x-2.5 text-xs font-mono animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Connect MCP Modal */}
      <ConnectMcpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        isConnected={isMcpConnected}
        onToggleConnection={() => setIsMcpConnected((prev) => !prev)}
        serverUrl={mcpServerUrl}
        setServerUrl={setMcpServerUrl}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewItem?.product ?? null}
        whyMatched={quickViewItem?.whyMatched}
        score={quickViewItem?.score}
        onClose={() => setQuickViewItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-6 mt-16 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>BagPacker AI • Semantic Search & Catalog Discovery</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
            >
              MCP Tool Schema & Protocol
            </button>
            <span>•</span>
            <span className="text-zinc-400">23 Products Indexed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


