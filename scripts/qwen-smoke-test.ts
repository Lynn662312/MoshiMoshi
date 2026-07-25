import OpenAI from "openai";
import {
  buildConversationPrompt,
  buildRescuePrompt,
  conversationSystemPrompt,
  rescueSystemPrompt,
} from "../src/lib/ai/prompts";
import {
  conversationOutputWithoutProviderSchema,
  rescueOutputWithoutProviderSchema,
  type ExplanationLanguage,
  type RescuePlan,
} from "../src/lib/schemas/rescue";
import type { RescueSession } from "../src/lib/types/database";

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

const client = new OpenAI({
  apiKey,
  baseURL,
  timeout,
  maxRetries: 0,
});

async function requestJson(system: string, prompt: string) {
  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    enable_thinking: enableThinking,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
    enable_thinking: boolean;
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Qwen returned an empty response.");
  return { response, json: JSON.parse(content) as unknown };
}

function testSession(
  language: ExplanationLanguage,
  plan: RescuePlan,
): RescueSession {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    user_id: "00000000-0000-4000-8000-000000000001",
    category: "transport",
    situation:
      "I missed the last train and need help finding the correct official staff.",
    location_context: "Tokyo Station",
    known_information: "I have my ticket.",
    preferred_language: language,
    status: "active",
    diagnosis: plan.diagnosis,
    rescue_plan: plan,
    conversation_history: [],
    provider_metadata: { name: "qwen", fallbackUsed: false },
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

async function testLanguage(language: ExplanationLanguage) {
  const startedAt = Date.now();
  const rescue = await requestJson(
    rescueSystemPrompt,
    buildRescuePrompt({
      category: "transport",
      situation:
        "I missed the last train and need help finding the correct official staff.",
      locationContext: "Tokyo Station",
      knownInformation: "I have my ticket.",
      preferredLanguage: language,
    }),
  );
  const plan = rescueOutputWithoutProviderSchema.parse(rescue.json);
  const conversation = await requestJson(
    conversationSystemPrompt,
    buildConversationPrompt(
      testSession(language, plan),
      "終電はもう終わりました。駅の案内所で相談してください。",
    ),
  );
  const reply = conversationOutputWithoutProviderSchema.parse(
    conversation.json,
  );
  const explanationText = [
    plan.diagnosis.title,
    plan.diagnosis.summary,
    plan.safetyNote,
    reply.staffMeaning,
    reply.recommendedAction,
    reply.likelyNextStep,
  ].join(" ");

  if (
    language === "Simplified Chinese" &&
    !/[\u3400-\u9fff]/u.test(explanationText)
  ) {
    throw new Error("Simplified Chinese test returned no Chinese explanations.");
  }

  return {
    language,
    rescueModel: rescue.response.model,
    conversationModel: conversation.response.model,
    elapsedMs: Date.now() - startedAt,
    title: plan.diagnosis.title,
    conversationStage: reply.conversationStage,
    japaneseReply: reply.reply.japanese,
    romajiReply: reply.reply.romaji,
  };
}

async function main() {
  const startedAt = Date.now();
  try {
    const results = [];
    for (const language of [
      "English",
      "Simplified Chinese",
    ] satisfies ExplanationLanguage[]) {
      results.push(await testLanguage(language));
    }
    console.log(
      JSON.stringify({ ok: true, elapsedMs: Date.now() - startedAt, results }),
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
