import "server-only";

import { createProviderCall } from "@/lib/ai/provider-core";

export function getGmiProvider() {
  return createProviderCall({
    apiKey: process.env.GMI_API_KEY,
    baseURL:
      process.env.GMI_BASE_URL ?? "https://api.gmi-serving.com/v1",
    model: process.env.GMI_MODEL ?? "Qwen/Qwen3.7-Max",
    label: "GMI",
  });
}
