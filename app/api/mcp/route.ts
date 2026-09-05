import { NextRequest, NextResponse } from "next/server";
import { searchProducts, SearchFilters } from "@/lib/semantic-search";
import { PRODUCT_CATALOG } from "@/lib/products-data";

// Standard MCP Tool Specifications for Product Listings
export const MCP_TOOLS_CATALOG = [
  {
    name: "query_listings",
    description: "Search and discover products from the store catalog using natural language (e.g. 'warm jacket for hiking in the rain', 'shoes for standing all day', 'waterproof bag for laptop'). Returns ranked products, prices, ratings, and 'Why this matched' explanations.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Everyday natural language query describing what the customer needs.",
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
        maxPrice: {
          type: "number",
          description: "Maximum budget / price in USD",
        },
        minRating: {
          type: "number",
          description: "Minimum rating (e.g. 4.5)",
        },
        inStockOnly: {
          type: "boolean",
          description: "Filter only currently in-stock products",
        },
        limit: {
          type: "number",
          default: 5,
          description: "Maximum number of recommendations to return",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description: "Fetch complete technical specifications, inventory, and materials for a specific product ID.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The unique product ID (e.g. 'prod-01', 'prod-02')",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "list_categories",
    description: "List all product categories available in the store catalog.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// GET: Server info, tool list, and client configuration
export async function GET() {
  return NextResponse.json({
    jsonrpc: "2.0",
    server: {
      name: "product-catalog-mcp-server",
      version: "1.0.0",
      description: "Model Context Protocol (MCP) server for querying product listings with natural language semantic search.",
    },
    capabilities: {
      tools: MCP_TOOLS_CATALOG,
    },
    transports: {
      stdio: "node mcp-server.mjs",
      http_jsonrpc: "POST /api/mcp",
    },
    claude_desktop_config: {
      mcpServers: {
        "product-catalog": {
          command: "node",
          args: ["<path-to-project>/mcp-server.mjs"],
        },
      },
    },
  });
}

// POST: JSON-RPC 2.0 MCP Request Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standard MCP Protocol Methods
    const { method, params, id } = body;

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "product-catalog-mcp-server",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
          },
        },
      });
    }

    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: MCP_TOOLS_CATALOG,
        },
      });
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params || {};

      if (name === "query_listings") {
        const filters: SearchFilters = {
          category: args?.category,
          maxPrice: args?.maxPrice,
          minRating: args?.minRating,
          inStockOnly: args?.inStockOnly,
        };

        const limit = args?.limit || 5;
        const searchRes = searchProducts(args?.query || "", filters, "semantic");

        if (searchRes.status === "no_close_matches" || searchRes.results.length === 0) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `No close matches found for "${args?.query}". Try adjusting description or criteria.`,
                },
              ],
            },
          });
        }

        const topMatches = searchRes.results.slice(0, limit);
        const formatted = topMatches
          .map((r, i) => {
            const p = r.product;
            return `${i + 1}. **${p.title}** ($${p.price.toFixed(2)} | ★${p.rating} [${p.reviewsCount} reviews])\n   - **${r.whyMatched}**\n   - Category: ${p.category}\n   - Description: ${p.description}\n   - Key Features: ${p.features.join(", ")}`;
          })
          .join("\n\n");

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `### Found ${topMatches.length} matching products for "${args?.query}":\n\n${formatted}`,
              },
            ],
            structuredData: topMatches.map((m) => ({
              id: m.product.id,
              title: m.product.title,
              price: m.product.price,
              rating: m.product.rating,
              whyMatched: m.whyMatched,
              category: m.product.category,
            })),
          },
        });
      }

      if (name === "get_product_details") {
        const product = PRODUCT_CATALOG.find((p) => p.id === args?.productId);
        if (!product) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Product '${args?.productId}' was not found in catalog.`,
                },
              ],
            },
          });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(product, null, 2),
              },
            ],
          },
        });
      }

      if (name === "list_categories") {
        const categories = Array.from(new Set(PRODUCT_CATALOG.map((p) => p.category)));
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(categories, null, 2),
              },
            ],
          },
        });
      }

      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Tool '${name}' not recognized` },
        },
        { status: 404 }
      );
    }

    // Direct REST fallback if client sent plain body { query: "..." }
    if (body.query) {
      const searchRes = searchProducts(body.query, body.filters || {}, "semantic");
      return NextResponse.json({
        jsonrpc: "2.0",
        result: searchRes,
      });
    }

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method '${method}' not supported` },
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: msg },
      },
      { status: 500 }
    );
  }
}
