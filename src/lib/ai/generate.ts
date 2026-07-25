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
  isLockerDemo,
  lockerDemoPlan,
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

export async function generateRescue(
  input: RescueInput,
): Promise<RescueOutput> {
  try {
    const plan = await callAndValidate(
      getQwenProvider(),
      rescueOutputWithoutProviderSchema,
      rescueSystemPrompt,
      (correction) => buildRescuePrompt(input, correction),
    );
    return { ...plan, provider: { name: "qwen", fallbackUsed: false } };
  } catch (qwenError) {
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
          ...lockerDemoPlan,
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
  try {
    const reply = await callAndValidate(
      getQwenProvider(),
      conversationOutputWithoutProviderSchema,
      conversationSystemPrompt,
      (correction) =>
        buildConversationPrompt(session, staffMessage, correction),
    );
    return { ...reply, provider: { name: "qwen", fallbackUsed: false } };
  } catch (qwenError) {
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
          ...demoConversationReply(staffMessage),
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
