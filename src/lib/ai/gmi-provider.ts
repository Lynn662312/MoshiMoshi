import "server-only";

import { createProviderCall } from "@/lib/ai/provider-core";

export function getGmiProvider() {
  return createProviderCall({
    apiKey: process.env.GMI_API_KEY,
    baseURL: process.env.GMI_BASE_URL,
    model: process.env.GMI_MODEL,
    label: "GMI",
  });
}
