"use client";

import React from "react";
import { Cpu } from "lucide-react";

interface HeaderProps {
  onOpenMcp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMcp }) => {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
            Ø
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                RedactEngine
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                v1.0 • Spec 3
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Sensitive Personal Information Detection & Context-Aware Redaction
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Local & Secure • Zero Retention</span>
          </div>

          <button
            onClick={onOpenMcp}
            className="flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-800 transition-all shadow-xs"
            title="Inspect Model Context Protocol (MCP) Tool Integration"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-600" />
            <span>MCP Tool Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
};
