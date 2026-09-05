import { NextRequest, NextResponse } from "next/server";
import { detectSensitiveData, DEFAULT_CONFIG, RedactionConfig } from "@/lib/detector";

// MCP Tool Schema for external agent integration (Bonus Challenge)
export const MCP_TOOL_DEFINITION = {
  name: "redact_sensitive_data",
  description: "Scans text for personal identifiable information (names, emails, phone numbers, ID numbers, credit cards, API secrets, IP addresses) and returns redacted text with detected entity locations and confidence scores.",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The raw text or document content to scan and redact",
      },
      style: {
        type: "string",
        enum: ["tag", "mask", "hash", "synthetic", "remove"],
        description: "Redaction masking strategy. 'tag' replaces with [NAME], [EMAIL]; 'mask' with bullet chars; 'hash' with cryptographic pseudonym; 'synthetic' with fake data; 'remove' deletes value.",
        default: "tag",
      },
      confidenceThreshold: {
        type: "number",
        minimum: 0.0,
        maximum: 1.0,
        description: "Minimum confidence score (0.0 - 1.0) required to redact an entity",
        default: 0.6,
      },
      enabledTypes: {
        type: "object",
        description: "Map of entity types to boolean flag indicating whether to redact",
      },
    },
    required: ["text"],
  },
};

// GET returns the tool definition for agent discovery
export async function GET() {
  return NextResponse.json({
    status: "online",
    engine: "Sensitive Data Detection & Redaction Engine v1.0",
    mcp_tool: MCP_TOOL_DEFINITION,
    sample_curl: `curl -X POST http://localhost:3000/api/redact \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Contact John Mehta at john.mehta@email.com or 9876543210 for details."}'`,
  });
}

// POST executes detection and redaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, config } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "Invalid input: 'text' field is required and must be a string",
          code: "MISSING_TEXT",
        },
        { status: 400 }
      );
    }

    const mergedConfig: RedactionConfig = {
      ...DEFAULT_CONFIG,
      ...(config || {}),
      enabledTypes: {
        ...DEFAULT_CONFIG.enabledTypes,
        ...(config?.enabledTypes || {}),
      },
    };

    const startTime = performance.now();
    const result = detectSensitiveData(text, mergedConfig);
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      success: true,
      originalText: text,
      redactedText: result.redactedText,
      summaryReport: result.summaryReport,
      counts: result.counts,
      entities: result.entities,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        error: "Failed to process redaction request",
        details: message,
      },
      { status: 500 }
    );
  }
}
