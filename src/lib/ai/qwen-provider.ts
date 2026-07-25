import "server-only";

import { createProviderCall } from "@/lib/ai/provider-core";

export function getQwenProvider() {
  const timeoutMs = Number(process.env.QWEN_TIMEOUT_MS);

  return createProviderCall({
    apiKey: process.env.QWEN_API_KEY ?? process.env.DASHSCOPE_API_KEY,
    baseURL:
      process.env.QWEN_BASE_URL ??
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    model: process.env.QWEN_MODEL ?? "qwen3.7-plus",
    label: "Qwen",
    enableThinking:
      process.env.QWEN_ENABLE_THINKING?.toLowerCase() !== "false",
    timeoutMs:
      Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 120_000,
  });
}
