"use client";

import React, { useState } from "react";
import { X, Cpu, Copy, Check, Terminal, Play, Bot } from "lucide-react";
import { MCP_TOOLS_CATALOG } from "@/app/api/mcp/route";

interface McpSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpSearchModal: React.FC<McpSearchModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"connect" | "tools" | "test">("connect");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Live test state
  const [testQuery, setTestQuery] = useState("warm jacket for hiking in the rain");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const claudeDesktopConfig = `{
  "mcpServers": {
    "product-catalog": {
      "command": "node",
      "args": [
        "c:/Users/asush/OneDrive/Desktop/TCS Hackathon/bag_packer/mcp-server.mjs"
      ]
    }
  }
}`;

  const cursorConfig = `{
  "mcpServers": {
    "product-catalog": {
      "command": "node",
      "args": ["\${workspaceFolder}/mcp-server.mjs"]
    }
  }
}`;

  const httpCurlExample = `curl -X POST http://localhost:3000/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query_listings",
      "arguments": {
        "query": "warm jacket for hiking in the rain"
      }
    }
  }'`;

  const runLiveTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: "query_listings",
            arguments: {
              query: testQuery,
              limit: 3,
            },
          },
        }),
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setTestResponse(`Error: ${err instanceof Error ? err.message : "Failed to call MCP API"}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center space-x-2">
                <span>Product Catalog MCP Server</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                  JSON-RPC 2.0
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Exposes product listings so any LLM (Claude, Cursor, Agents) can search & discover products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-zinc-200 bg-white space-x-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("connect")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "connect"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Connect Any LLM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "tools"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Tools Schema ({MCP_TOOLS_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("test")}
            className={`py-3 border-b-2 font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === "test"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Play className="w-3 h-3 text-emerald-600" />
            <span>Live Test Tool Call</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-zinc-700 flex-1">
          {activeTab === "connect" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start space-x-3 font-sans">
                <Bot className="w-5 h-5 text-zinc-800 mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-900 block">
                    How LLMs Call This MCP Server
                  </span>
                  <p>
                    This server adheres to the official <strong>Model Context Protocol (MCP)</strong>. When connected to Claude Desktop, Cursor, Antigravity, or autonomous agent loops, the LLM autonomously invokes the <code className="bg-zinc-200/80 px-1 py-0.5 rounded font-mono text-[11px] text-zinc-900">query_listings</code> tool to find matching products, compare prices, and read the generated &ldquo;Why this matched&rdquo; explanations.
                  </p>
                </div>
              </div>

              {/* Claude Desktop Config */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-zinc-600">
                    Claude Desktop (<code className="lowercase">claude_desktop_config.json</code>)
                  </span>
                  <button
                    onClick={() => copyToClipboard(claudeDesktopConfig, "claude")}
                    className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
                  >
                    {copiedType === "claude" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "claude" ? "Copied" : "Copy Config"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                  {claudeDesktopConfig}
                </pre>
              </div>

              {/* Cursor Config */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-zinc-600">
                    Cursor IDE (<code className="lowercase">.cursor/mcp.json</code>)
                  </span>
                  <button
                    onClick={() => copyToClipboard(cursorConfig, "cursor")}
                    className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
                  >
                    {copiedType === "cursor" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "cursor" ? "Copied" : "Copy Config"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                  {cursorConfig}
                </pre>
              </div>

              {/* HTTP / JSON-RPC Agent Call */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-zinc-600 flex items-center space-x-1">
                    <Terminal className="w-3 h-3" />
                    <span>Direct Web JSON-RPC Call (POST /api/mcp)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(httpCurlExample, "curl")}
                    className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
                  >
                    {copiedType === "curl" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "curl" ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                  {httpCurlExample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                The MCP server registers the following 3 callable tools that enable agents to query listings, inspect product details, and list categories:
              </p>

              {MCP_TOOLS_CATALOG.map((tool) => (
                <div
                  key={tool.name}
                  className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-xs px-2 py-0.5 rounded bg-zinc-200 border border-zinc-300">
                      {tool.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">MCP Tool</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-sans">{tool.description}</p>
                  <pre className="p-2.5 bg-zinc-900 text-zinc-100 rounded-lg text-[10px] overflow-x-auto">
                    {JSON.stringify(tool.inputSchema, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === "test" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase text-zinc-600 block">
                  Simulate LLM Query
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter query as an LLM would call it..."
                    className="flex-1 px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={runLiveTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
                  >
                    {isTesting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Call Tool</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase text-zinc-600">
                      Live JSON-RPC 2.0 Response from /api/mcp
                    </span>
                    <button
                      onClick={() => copyToClipboard(testResponse, "test-resp")}
                      className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-zinc-900"
                    >
                      {copiedType === "test-resp" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedType === "test-resp" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-zinc-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed max-h-72 border border-zinc-800">
                    {testResponse}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-mono">
            stdio: <code className="text-zinc-700">mcp-server.mjs</code> • http: <code className="text-zinc-700">/api/mcp</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-mono hover:bg-zinc-800 transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
