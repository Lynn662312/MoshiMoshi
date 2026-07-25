import OpenAI from "openai";
import {
  buildRescuePrompt,
  rescueSystemPrompt,
} from "../src/lib/ai/prompts";
import { rescueOutputWithoutProviderSchema } from "../src/lib/schemas/rescue";

const apiKey = process.env.QWEN_API_KEY ?? process.env.DASHSCOPE_API_KEY;
const baseURL =
  process.env.QWEN_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const model = process.env.QWEN_MODEL ?? "qwen3.7-plus";
const timeout = Number(process.env.QWEN_TIMEOUT_MS) || 120_000;
const enableThinking =
  process.env.QWEN_ENABLE_THINKING?.toLowerCase() !== "false";

if (!apiKey) {
  throw new Error("Set QWEN_API_KEY or DASHSCOPE_API_KEY before testing Qwen.");
}

async function main() {
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout,
    maxRetries: 0,
  });
  const startedAt = Date.now();

  try {
    const request = {
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      enable_thinking: enableThinking,
      messages: [
        { role: "system", content: rescueSystemPrompt },
        {
          role: "user",
          content: buildRescuePrompt({
            category: "transport",
            situation:
              "I missed the last train and need help finding the correct official staff.",
            locationContext: "Tokyo Station",
            knownInformation: "I have my ticket.",
            preferredLanguage: "English",
          }),
        },
      ],
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
      enable_thinking: boolean;
    };
    const response = await client.chat.completions.create(request);

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Qwen returned an empty response.");

    const plan = rescueOutputWithoutProviderSchema.parse(JSON.parse(content));
    console.log(
      JSON.stringify({
        ok: true,
        model: response.model,
        elapsedMs: Date.now() - startedAt,
        title: plan.diagnosis.title,
        immediateSteps: plan.immediateSteps.length,
      }),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        ok: false,
        model,
        elapsedMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : "Unknown Qwen error",
      }),
    );
    process.exitCode = 1;
  }
}

void main();
