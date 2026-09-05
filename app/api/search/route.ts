import { NextRequest, NextResponse } from "next/server";
import { searchProducts, SearchFilters } from "@/lib/semantic-search";

// MCP Tool Definition for Agent Chatbot Integration (Bonus Challenge)
export const SEARCH_MCP_TOOL_DEFINITION = {
  name: "search_products",
  description: "Performs natural language semantic search and discovery over the product catalog. Maps everyday descriptions (like 'warm jacket for hiking in the rain' or 'shoes for nurses standing all day') to product features and attributes with relevance explanations.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The natural language query expressing user intent or product requirements.",
      },
      category: {
        type: "string",
        enum: [
          "All",
          "Jackets & Outerwear",
          "Footwear",
          "Backpacks & Luggage",
          "Trail Equipment",
          "Activewear",
          "Accessories",
        ],
        description: "Optional category filter",
      },
      minPrice: {
        type: "number",
        description: "Minimum price in USD",
      },
      maxPrice: {
        type: "number",
        description: "Maximum price in USD",
      },
      minRating: {
        type: "number",
        minimum: 0,
        maximum: 5,
        description: "Minimum product rating",
      },
      inStockOnly: {
        type: "boolean",
        description: "Whether to only return items currently in stock",
      },
      mode: {
        type: "string",
        enum: ["semantic", "keyword"],
        default: "semantic",
        description: "Search mode: 'semantic' uses concept embeddings and intent mapping; 'keyword' uses plain literal matching.",
      },
    },
    required: ["query"],
  },
};

// GET handler: supports query string parameters & MCP tool schema inspection
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? searchParams.get("query");
  const inspectMcp = searchParams.get("mcp") === "true";

  if (inspectMcp || !query) {
    return NextResponse.json({
      status: "online",
      engine: "Natural Language Product Search & Discovery v1.0",
      mcp_tool: SEARCH_MCP_TOOL_DEFINITION,
      sample_queries: [
        "warm jacket for hiking in the rain",
        "shoes for standing all day in hospital",
        "waterproof backpack for carrying laptop in the rain",
        "lightweight tent for mountain backpacking",
      ],
      sample_curl: `curl -X POST http://localhost:3000/api/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "warm jacket for hiking in the rain"}'`,
    });
  }

  const filters: SearchFilters = {
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
    inStockOnly: searchParams.get("inStock") === "true",
  };

  const mode = searchParams.get("mode") === "keyword" ? "keyword" : "semantic";
  const startTime = performance.now();
  const response = searchProducts(query, filters, mode);
  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  return NextResponse.json({
    ...response,
    durationMs,
    timestamp: new Date().toISOString(),
  });
}

// POST handler: main search endpoint for client requests & chatbot agents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, filters, mode } = body;

    const startTime = performance.now();
    const response = searchProducts(
      typeof query === "string" ? query : "",
      filters || {},
      mode === "keyword" ? "keyword" : "semantic"
    );
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      ...response,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        error: "Failed to execute semantic search",
        details: message,
      },
      { status: 500 }
    );
  }
}
