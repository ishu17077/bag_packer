import Groq from "groq-sdk";
import { Product } from "./products-data";

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    return null;
  }
  return new Groq({ apiKey });
}

export interface GroqRerankResult {
  productId: string;
  relevanceScore: number;
  whyMatched: string;
}

/**
 * Uses Groq LLM (llama-3.3-70b-versatile or llama-3.1-8b-instant) to perform
 * context-aware query intent understanding and product re-ranking.
 */
export async function groqRerankProducts(
  query: string,
  candidateProducts: Product[]
): Promise<GroqRerankResult[] | null> {
  const groq = getGroqClient();
  if (!groq || candidateProducts.length === 0) {
    return null;
  }

  const catalogSummary = candidateProducts.slice(0, 8).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    features: p.features,
    description: p.description,
  }));

  const systemPrompt = `You are an expert e-commerce semantic search and discovery engine.
Given a user's natural language search query and a list of candidate products, analyze the user's implicit needs, environmental conditions, and intent.
Rank the candidate products by relevance.
For each product, generate a concise one-line reason why it matches the user's intent, formatted strictly as: "Matches: [feature 1], [feature 2], [feature 3]".
Respond ONLY with a valid JSON object matching this schema:
{
  "results": [
    {
      "productId": "prod-01",
      "relevanceScore": 98,
      "whyMatched": "Matches: waterproof, insulated, outdoor use"
    }
  ]
}`;

  const userPrompt = `Search Query: "${query}"

Candidate Products:
${JSON.stringify(catalogSummary, null, 2)}

Return the ranked JSON object:`;

  // Try fast active models on this tier
  const modelsToTry = ["qwen/qwen3.8-27b", "groq/compound-mini"];

  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1000,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) continue;

      const parsed = JSON.parse(text);
      const results = Array.isArray(parsed)
        ? parsed
        : parsed.results || parsed.products || parsed.rankedProducts;

      if (Array.isArray(results) && results.length > 0) {
        return results as GroqRerankResult[];
      }
    } catch (err) {
      console.warn(`Groq model ${model} error, trying next:`, err instanceof Error ? err.message : err);
    }
  }

  return null;
}
