import "server-only";

import {
  conversationOutputWithoutProviderSchema,
  rescueOutputWithoutProviderSchema,
  type ConversationOutput,
  type RescueInput,
  type RescueOutput,
} from "@/lib/schemas/rescue";
import type { RescueSession } from "@/lib/types/database";
import {
  demoConversationReply,
  getLockerDemoPlan,
  isLockerDemo,
} from "@/lib/ai/demo-fixture";
import { getGmiProvider } from "@/lib/ai/gmi-provider";
import {
  buildConversationPrompt,
  buildRescuePrompt,
  conversationSystemPrompt,
  rescueSystemPrompt,
} from "@/lib/ai/prompts";
import { callAndValidate } from "@/lib/ai/provider-core";
import { getQwenProvider } from "@/lib/ai/qwen-provider";

function demoEnabled() {
  return process.env.DEMO_MODE?.toLowerCase() === "true";
}

type AIProviderMode = "auto" | "qwen" | "gmi";

function providerMode(): AIProviderMode {
  const configured = process.env.FORCE_AI_PROVIDER ?? "auto";
  if (!["auto", "qwen", "gmi"].includes(configured)) {
    throw new Error(
      "FORCE_AI_PROVIDER must be one of: auto, qwen, or gmi.",
    );
  }
  if (process.env.NODE_ENV === "production" && configured !== "auto") {
    throw new Error(
      "FORCE_AI_PROVIDER overrides are only available outside production.",
    );
  }
  return configured as AIProviderMode;
}

function simulateQwenFailure(mode: AIProviderMode) {
  return (
    mode === "auto" &&
    process.env.NODE_ENV !== "production" &&
    process.env.SIMULATE_QWEN_FAILURE?.toLowerCase() === "true"
  );
}

export async function generateRescue(
  input: RescueInput,
): Promise<RescueOutput> {
  const mode = providerMode();

  if (mode === "gmi") {
    const plan = await callAndValidate(
      getGmiProvider(),
      rescueOutputWithoutProviderSchema,
      rescueSystemPrompt,
      (correction) => buildRescuePrompt(input, correction),
    );
    return { ...plan, provider: { name: "gmi", fallbackUsed: true } };
  }

  try {
    if (simulateQwenFailure(mode)) {
      throw new Error("Simulated Qwen failure for provider-flow testing.");
    }
    const plan = await callAndValidate(
      getQwenProvider(),
      rescueOutputWithoutProviderSchema,
      rescueSystemPrompt,
      (correction) => buildRescuePrompt(input, correction),
    );
    return { ...plan, provider: { name: "qwen", fallbackUsed: false } };
  } catch (qwenError) {
    if (mode === "qwen") {
      throw qwenError;
    }
    try {
      const plan = await callAndValidate(
        getGmiProvider(),
        rescueOutputWithoutProviderSchema,
        rescueSystemPrompt,
        (correction) => buildRescuePrompt(input, correction),
      );
      return { ...plan, provider: { name: "gmi", fallbackUsed: true } };
    } catch (gmiError) {
      if (demoEnabled() && isLockerDemo(input)) {
        return {
          ...getLockerDemoPlan(input.preferredLanguage),
          provider: {
            name: "qwen",
            fallbackUsed: false,
            fixtureUsed: true,
          },
        };
      }

      console.error("Rescue providers failed", { qwenError, gmiError });
      throw new Error(
        "Moshi could not reach its rescue providers. Please try again.",
      );
    }
  }
}

export async function generateConversation(
  session: RescueSession,
  staffMessage: string,
): Promise<ConversationOutput> {
  const mode = providerMode();

  if (mode === "gmi") {
    const reply = await callAndValidate(
      getGmiProvider(),
      conversationOutputWithoutProviderSchema,
      conversationSystemPrompt,
      (correction) =>
        buildConversationPrompt(session, staffMessage, correction),
    );
    return { ...reply, provider: { name: "gmi", fallbackUsed: true } };
  }

  try {
    if (simulateQwenFailure(mode)) {
      throw new Error("Simulated Qwen failure for provider-flow testing.");
    }
    const reply = await callAndValidate(
      getQwenProvider(),
      conversationOutputWithoutProviderSchema,
      conversationSystemPrompt,
      (correction) =>
        buildConversationPrompt(session, staffMessage, correction),
    );
    return { ...reply, provider: { name: "qwen", fallbackUsed: false } };
  } catch (qwenError) {
    if (mode === "qwen") {
      throw qwenError;
    }
    try {
      const reply = await callAndValidate(
        getGmiProvider(),
        conversationOutputWithoutProviderSchema,
        conversationSystemPrompt,
        (correction) =>
          buildConversationPrompt(session, staffMessage, correction),
      );
      return { ...reply, provider: { name: "gmi", fallbackUsed: true } };
    } catch (gmiError) {
      if (
        demoEnabled() &&
        session.category === "locker" &&
        session.situation.toLowerCase().includes("ic card")
      ) {
        return {
          ...demoConversationReply(
            staffMessage,
            session.preferred_language ?? "English",
          ),
          provider: {
            name: "qwen",
            fallbackUsed: false,
            fixtureUsed: true,
          },
        };
      }

      console.error("Conversation providers failed", {
        qwenError,
        gmiError,
      });
      throw new Error(
        "Moshi could not prepare a reply right now. Please try again.",
      );
    }
  }
}
