import "server-only";

import OpenAI from "openai";
import { z } from "zod";

type ProviderConfig = {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  label: string;
};

export type ProviderCall = (
  systemPrompt: string,
  userPrompt: string,
) => Promise<unknown>;

function parseJson(content: string) {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(withoutFence);
}

export function createProviderCall(config: ProviderConfig): ProviderCall {
  return async (systemPrompt, userPrompt) => {
    if (!config.apiKey || !config.baseURL || !config.model) {
      throw new Error(`${config.label} is not configured.`);
    }

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: 20_000,
      maxRetries: 0,
    });

    const response = await client.chat.completions.create({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`${config.label} returned an empty response.`);
    }

    return parseJson(content);
  };
}

export async function callAndValidate<T>(
  call: ProviderCall,
  schema: z.ZodType<T>,
  systemPrompt: string,
  makePrompt: (correction?: string) => string,
) {
  let lastError = "Unknown validation error";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const value = await call(
        systemPrompt,
        makePrompt(attempt ? lastError : undefined),
      );
      return schema.parse(value);
    } catch (error) {
      lastError =
        error instanceof z.ZodError
          ? z.prettifyError(error)
          : error instanceof Error
            ? error.message
            : "Provider call failed";
    }
  }

  throw new Error(lastError);
}
