"use client";

import React from "react";
import { Cpu, ShoppingBag } from "lucide-react";

interface HeaderProps {
  onOpenMcp: () => void;
  isMcpConnected: boolean;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMcp,
  isMcpConnected,
  cartCount,
}) => {
  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            <span className="text-emerald-400">✦</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-zinc-900">
                BagPacker
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold">
                AI Search
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block font-mono">
              Natural Language Semantic Product Discovery
            </p>
          </div>
        </div>

        {/* Action Controls: Connect MCP & Cart */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Option for Connect MCP */}
          <button
            onClick={onOpenMcp}
            className={`flex items-center space-x-2 text-xs font-mono px-3.5 py-2 rounded-xl border transition-all shadow-2xs active:scale-98 ${
              isMcpConnected
                ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300"
            }`}
            title="Configure and connect Model Context Protocol (MCP) server"
          >
            <Cpu className={`w-3.5 h-3.5 ${isMcpConnected ? "text-emerald-600" : "text-zinc-600"}`} />
            <span className="font-medium">
              {isMcpConnected ? "MCP Connected" : "Connect MCP"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMcpConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"
              }`}
            />
          </button>

          {/* Mini Bag / Cart Indicator */}
          <div className="relative">
            <div
              className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 flex items-center justify-center shadow-2xs"
              title="Items in your bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
