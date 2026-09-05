"use client";

import React, { useState } from "react";
import { X, Cpu, Copy, Check, Terminal, Bot } from "lucide-react";
import { SEARCH_MCP_TOOL_DEFINITION } from "@/app/api/search/route";

interface McpSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpSearchModal: React.FC<McpSearchModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const curlExample = `curl -X POST http://localhost:3000/api/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "warm jacket for hiking in the rain",
    "mode": "semantic"
  }'`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-zinc-900" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-900">
              Use Case 4 • MCP Semantic Search Tool Integration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs text-zinc-700">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start space-x-2.5 font-sans">
            <Bot className="w-4 h-4 text-zinc-700 mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-900 block">
                Bonus Challenge: Chatbot Agent Interoperability (Use Case 5)
              </span>
              <p>
                This semantic search engine is wrapped with a standardized <strong>Model Context Protocol (MCP)</strong> interface. When a user asks an AI assistant <em>&ldquo;Can you suggest a warm waterproof jacket for my rainy mountain hike?&rdquo;</em>, the agent autonomously invokes the <code className="bg-zinc-200/80 px-1 py-0.5 rounded font-mono text-[11px] text-zinc-900">search_products</code> tool and extracts catalog recommendations with the generated relevance explanation.
              </p>
            </div>
          </div>

          {/* MCP Schema */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase text-zinc-500">
                MCP Tool Definition (JSON Schema)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(SEARCH_MCP_TOOL_DEFINITION, null, 2), "schema")
                }
                className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
              >
                {copiedType === "schema" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedType === "schema" ? "Copied" : "Copy Schema"}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg overflow-x-auto text-[11px] leading-snug">
              {JSON.stringify(SEARCH_MCP_TOOL_DEFINITION, null, 2)}
            </pre>
          </div>

          {/* cURL Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase text-zinc-500 flex items-center space-x-1">
                <Terminal className="w-3 h-3" />
                <span>Backend REST API cURL (/api/search)</span>
              </span>
              <button
                onClick={() => copyToClipboard(curlExample, "curl")}
                className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
              >
                {copiedType === "curl" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedType === "curl" ? "Copied" : "Copy cURL"}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-lg overflow-x-auto text-[11px] leading-snug">
              {curlExample}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-mono hover:bg-zinc-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
