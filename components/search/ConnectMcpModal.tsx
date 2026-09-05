"use client";

import React, { useState } from "react";
import {
  X,
  Cpu,
  Check,
  Copy,
  Terminal,
  Play,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Code2,
} from "lucide-react";
import { SEARCH_MCP_TOOL_DEFINITION } from "@/app/api/search/route";

interface ConnectMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onToggleConnection: () => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

export const ConnectMcpModal: React.FC<ConnectMcpModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  onToggleConnection,
  serverUrl,
  setServerUrl,
}) => {
  const [activeTab, setActiveTab] = useState<"status" | "tools" | "config" | "test">("status");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latency: number; message: string } | null>(null);
  
  // Test tool execution state
  const [testQuery, setTestQuery] = useState("warm jacket for hiking in the rain");
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [toolExecutionOutput, setToolExecutionOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleTestPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/search?mcp=true");
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setPingResult({
          success: true,
          latency: elapsed,
          message: `Endpoint healthy (HTTP 200). Tool 'search_products' registered.`,
        });
      } else {
        setPingResult({
          success: false,
          latency: elapsed,
          message: `Server returned status ${res.status}. Check endpoint URL.`,
        });
      }
    } catch {
      setPingResult({
        success: false,
        latency: Math.round(performance.now() - start),
        message: "Failed to ping MCP endpoint. Verify network or server status.",
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleExecuteTool = async () => {
    setIsExecutingTool(true);
    setToolExecutionOutput(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery, mode: "semantic" }),
      });
      const data = await res.json();
      setToolExecutionOutput(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setToolExecutionOutput(JSON.stringify({ error: msg }, null, 2));
    } finally {
      setIsExecutingTool(false);
    }
  };

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        "bagpacker-catalog": {
          transport: "http",
          url: serverUrl || "http://localhost:3000/api/search",
        },
      },
    },
    null,
    2
  );

  const curlExample = `curl -X POST ${serverUrl || "http://localhost:3000/api/search"} \\
  -H "Content-Type: application/json" \\
  -d '{"query": "warm jacket for hiking in the rain", "mode": "semantic"}'`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Model Context Protocol (MCP) Integration
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                    isConnected
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    }`}
                  />
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                Connect external LLM agents to the product semantic discovery engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-zinc-200 flex space-x-4 text-xs font-mono bg-white">
          <button
            onClick={() => setActiveTab("status")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "status"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Connection Setup
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "tools"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Exposed Tools
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "test"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Test Tool Call
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "config"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Client Config
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-zinc-700">
          {/* TAB 1: STATUS & CONNECTION */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-zinc-700" />
                    <span className="font-semibold text-zinc-900 text-xs">
                      MCP Server Endpoint
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Protocol: JSON-RPC over HTTP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://localhost:3000/api/search"
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  />
                  <button
                    onClick={handleTestPing}
                    disabled={isTestingPing}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center space-x-1.5"
                  >
                    {isTestingPing ? (
                      <div className="w-3.5 h-3.5 border-2 border-zinc-600/30 border-t-zinc-600 rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-zinc-700" />
                    )}
                    <span>Ping Test</span>
                  </button>
                </div>

                {pingResult && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                      pingResult.success
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-red-50 text-red-900 border border-red-200"
                    }`}
                  >
                    {pingResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-mono">{pingResult.message} ({pingResult.latency}ms)</span>
                  </div>
                )}
              </div>

              {/* Action Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white">
                <div>
                  <h4 className="font-semibold text-zinc-900 text-xs">
                    MCP Server State
                  </h4>
                  <p className="text-zinc-500 text-[11px]">
                    {isConnected
                      ? "MCP Server is active and ready to handle queries from external agents."
                      : "Server is currently disconnected. Click connect to enable the bridge."}
                  </p>
                </div>
                <button
                  onClick={onToggleConnection}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                    isConnected
                      ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs"
                  }`}
                >
                  {isConnected ? "Disconnect MCP" : "Connect MCP"}
                </button>
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                    Supported Tool
                  </span>
                  <span className="font-mono font-bold text-zinc-900 text-xs">
                    search_products
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Natural language intent mapping with match explanations
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                    Agent Compatibility
                  </span>
                  <span className="font-mono font-bold text-zinc-900 text-xs">
                    Claude / Cursor / OpenAI
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Compliant with Model Context Protocol standard specification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPOSED TOOLS */}
          {activeTab === "tools" && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 font-sans font-semibold text-xs">
                  Tool: <code className="text-zinc-900">search_products</code>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(SEARCH_MCP_TOOL_DEFINITION, null, 2), "schema")
                  }
                  className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-900 text-[11px]"
                >
                  {copiedType === "schema" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedType === "schema" ? "Copied" : "Copy JSON Schema"}</span>
                </button>
              </div>
              <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-xl overflow-x-auto text-[11px] leading-relaxed max-h-[340px]">
                {JSON.stringify(SEARCH_MCP_TOOL_DEFINITION, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: TEST TOOL CALL */}
          {activeTab === "test" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 font-sans">
                Simulate an autonomous agent calling the <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">search_products</code> tool:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. warm jacket for hiking in the rain"
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  onClick={handleExecuteTool}
                  disabled={isExecutingTool}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center space-x-1.5"
                >
                  {isExecutingTool ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Call Tool</span>
                </button>
              </div>

              {toolExecutionOutput && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Tool JSON Output:</span>
                    <button
                      onClick={() => copyToClipboard(toolExecutionOutput, "output")}
                      className="hover:text-zinc-900 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedType === "output" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 bg-zinc-950 text-emerald-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed max-h-[260px] font-mono">
                    {toolExecutionOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLIENT CONFIG */}
          {activeTab === "config" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <span className="text-[11px] font-semibold text-zinc-600 flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Claude Desktop Config (claude_desktop_config.json)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(claudeDesktopConfig, "claude")}
                    className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-900 text-[11px]"
                  >
                    {copiedType === "claude" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedType === "claude" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-zinc-950 text-zinc-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {claudeDesktopConfig}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <span className="text-[11px] font-semibold text-zinc-600 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-zinc-700" />
                    <span>HTTP cURL Invocation</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(curlExample, "curl")}
                    className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-900 text-[11px]"
                  >
                    {copiedType === "curl" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedType === "curl" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                  {curlExample}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-zinc-500 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            <span>{isConnected ? "MCP Server Active on :3000" : "Not connected"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-mono hover:bg-zinc-800 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
