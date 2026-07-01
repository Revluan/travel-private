import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../env";

export const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: env.DEEPSEEK_API_KEY,
  name: "deepseek",
});

// DeepSeek supports the OpenAI /chat/completions endpoint, not /responses.
// Use `.chat(modelId)` explicitly to avoid hitting the unsupported /responses path.
export const defaultModel = deepseek.chat("deepseek-chat");

