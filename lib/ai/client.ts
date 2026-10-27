import { createOpenAI } from "@ai-sdk/openai";

/**
 * Returns a configured model instance for the AI analysis pipeline.
 *
 * Supports Groq Free Tier (via OpenAI-compatible endpoint https://api.groq.com/openai/v1)
 * when GROQ_API_KEY is configured, as well as direct OpenAI API when OPENAI_API_KEY is present.
 *
 * Groq Free Models:
 * - `llama-3.3-70b-versatile` (Default recommended: high accuracy for nuanced political framing and JSON schema)
 * - `llama-3.1-8b-instant` (Ultra fast, lightweight)
 */
export function getAIModel(requestedModelName?: string) {
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  const envModel = process.env.AI_MODEL?.trim();

  // 1. Prefer Groq Free Tier if GROQ_API_KEY is configured
  if (groqApiKey) {
    const defaultGroqModel = "openai/gpt-oss-120b";
    const modelName = (requestedModelName || envModel || defaultGroqModel).trim();

    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: groqApiKey,
    });

    return {
      model: groq(modelName),
      modelName,
      provider: "groq",
    };
  }

  // 2. Direct OpenAI API fallback
  if (openaiApiKey) {
    const defaultOpenAIModel = "gpt-4o-mini";
    const modelName = (requestedModelName || envModel || defaultOpenAIModel).trim();

    const openai = createOpenAI({
      apiKey: openaiApiKey,
    });

    return {
      model: openai(modelName),
      modelName,
      provider: "openai",
    };
  }

  throw new Error(
    "Missing AI API key. Configure GROQ_API_KEY in .env.local to use the free Groq tier (https://console.groq.com/keys), or set OPENAI_API_KEY."
  );
}

/** Backwards-compatible alias */
export const getOpenAIModel = getAIModel;
