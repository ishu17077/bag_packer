"use client";

import React from "react";
import { Cpu, Search, ShieldCheck } from "lucide-react";

export type ActiveTab = "search" | "redact";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMcp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMcp,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            {activeTab === "search" ? "§" : "Ø"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                {activeTab === "search" ? "SemanticFinder" : "RedactEngine"}
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                {activeTab === "search" ? "Use Case 4" : "Use Case 3"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              {activeTab === "search"
                ? "Natural Language Product Search & Discovery"
                : "Sensitive Personal Information Detection & Redaction"}
            </p>
          </div>
        </div>

        {/* Use Case Tabs Switcher */}
        <nav className="flex items-center p-1 bg-zinc-100 rounded-lg border border-zinc-200">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === "search"
                ? "bg-white text-zinc-900 font-semibold shadow-2xs border border-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Use Case 4: Search</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("redact")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === "redact"
                ? "bg-white text-zinc-900 font-semibold shadow-2xs border border-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Use Case 3: Redact</span>
          </button>
        </nav>

        {/* MCP Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenMcp}
            className="flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-800 transition-all shadow-2xs"
            title="Inspect Model Context Protocol (MCP) Tool Integration"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-700" />
            <span className="hidden sm:inline">MCP Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
};
