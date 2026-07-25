import { z } from "zod";

export const rescueCategorySchema = z.enum([
  "locker",
  "transport",
  "hotel",
  "other",
]);

export const rescueInputSchema = z.object({
  category: rescueCategorySchema,
  situation: z.string().trim().min(12).max(3000),
  locationContext: z.string().trim().max(500).optional().default(""),
  knownInformation: z.string().trim().max(1500).optional().default(""),
  preferredLanguage: z.literal("English").default("English"),
});

const providerMetadataSchema = z.object({
  name: z.enum(["qwen", "gmi"]),
  fallbackUsed: z.boolean(),
  fixtureUsed: z.boolean().optional(),
});

export const diagnosisSchema = z.object({
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().min(8).max(600),
  goal: z.string().trim().min(3).max(300),
  urgency: z.enum(["low", "medium", "high"]),
  recommendedHelper: z.string().trim().min(2).max(200),
});

export const rescueOutputWithoutProviderSchema = z.object({
  diagnosis: diagnosisSchema,
  immediateSteps: z
    .array(
      z.object({
        order: z.number().int().positive(),
        action: z.string().trim().min(2).max(300),
        reason: z.string().trim().min(2).max(400),
      }),
    )
    .min(1)
    .max(6),
  informationToPrepare: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(150),
        whyNeeded: z.string().trim().min(2).max(300),
        example: z.string().trim().max(300).optional(),
      }),
    )
    .max(8),
  openingMessage: z.object({
    japanese: z.string().trim().min(2).max(1000),
    romaji: z.string().trim().min(2).max(1200),
    english: z.string().trim().min(2).max(1000),
  }),
  expectedQuestions: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        japanese: z.string().trim().min(1).max(600),
        romaji: z.string().trim().min(1).max(700),
        english: z.string().trim().min(1).max(600),
        whyTheyAsk: z.string().trim().min(1).max(500),
        suggestedAnswerJapanese: z.string().trim().min(1).max(600),
        suggestedAnswerRomaji: z.string().trim().min(1).max(700),
        suggestedAnswerEnglish: z.string().trim().min(1).max(600),
      }),
    )
    .max(8),
  staffHandoffCard: z.object({
    japanese: z.string().trim().min(2).max(1800),
    english: z.string().trim().min(2).max(1800),
  }),
  fallbackAction: z.string().trim().min(2).max(600),
  safetyNote: z.string().trim().min(2).max(600),
});

export const rescueOutputSchema = rescueOutputWithoutProviderSchema.extend({
  provider: providerMetadataSchema,
});

export const conversationInputSchema = z.object({
  rescueSessionId: z.string().uuid(),
  staffMessage: z.string().trim().min(1).max(2000),
});

export const conversationOutputWithoutProviderSchema = z.object({
  staffMeaning: z.string().trim().min(1).max(1000),
  conversationStage: z.string().trim().min(1).max(300),
  recommendedAction: z.string().trim().min(1).max(600),
  reply: z.object({
    japanese: z.string().trim().min(1).max(1000),
    romaji: z.string().trim().min(1).max(1200),
    english: z.string().trim().min(1).max(1000),
  }),
  likelyNextStep: z.string().trim().min(1).max(600),
  needsHumanHelp: z.boolean(),
});

export const conversationOutputSchema =
  conversationOutputWithoutProviderSchema.extend({
    provider: providerMetadataSchema,
  });

export const sessionMutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum(["active", "resolved", "archived"]),
  }),
  z.object({ action: z.literal("delete") }),
]);

export type RescueCategory = z.infer<typeof rescueCategorySchema>;
export type RescueInput = z.infer<typeof rescueInputSchema>;
export type RescueOutput = z.infer<typeof rescueOutputSchema>;
export type RescuePlan = z.infer<typeof rescueOutputWithoutProviderSchema>;
export type ConversationOutput = z.infer<typeof conversationOutputSchema>;
export type ConversationReply = z.infer<
  typeof conversationOutputWithoutProviderSchema
>;
