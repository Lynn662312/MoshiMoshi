import "server-only";

import { createProviderCall } from "@/lib/ai/provider-core";

export function getQwenProvider() {
  return createProviderCall({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL,
    model: process.env.QWEN_MODEL,
    label: "Qwen",
  });
}
