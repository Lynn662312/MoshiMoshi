import assert from "node:assert/strict";
import { generateRescue } from "../src/lib/ai/generate";
import {
  rescueOutputSchema,
  type RescueInput,
} from "../src/lib/schemas/rescue";

const input: RescueInput = {
  category: "transport",
  situation:
    "I missed the last train at Tokyo Station and need the correct official staff to ask about safe next steps.",
  locationContext: "Tokyo Station",
  knownInformation: "I still have my train ticket.",
  preferredLanguage: "English",
};

type Mode = "qwen" | "gmi" | "auto";

async function verifyGmiConfiguration() {
  const baseURL = (
    process.env.GMI_BASE_URL ?? "https://api.gmi-serving.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.GMI_MODEL ?? "Qwen/Qwen3.7-Max";
  const apiKey = process.env.GMI_API_KEY;
  assert(apiKey, "GMI_API_KEY is required.");

  const response = await fetch(`${baseURL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  assert.equal(response.status, 200, "GMI /models request must succeed.");
  const body = (await response.json()) as {
    data?: Array<{ id?: string }>;
  };
  const modelIds = body.data?.flatMap((item) => (item.id ? [item.id] : []));
  assert(modelIds?.includes(model), `Configured GMI model not found: ${model}`);

  return { baseURL, model };
}

async function runMode(mode: Mode, simulateQwenFailure = false) {
  process.env.FORCE_AI_PROVIDER = mode;
  process.env.SIMULATE_QWEN_FAILURE = simulateQwenFailure ? "true" : "false";
  const startedAt = Date.now();
  const result = rescueOutputSchema.parse(await generateRescue(input));

  if (mode === "qwen") {
    assert.deepEqual(result.provider, {
      name: "qwen",
      fallbackUsed: false,
    });
  } else {
    assert.deepEqual(result.provider, {
      name: "gmi",
      fallbackUsed: true,
    });
  }

  return {
    mode,
    simulatedQwenFailure: simulateQwenFailure,
    elapsedMs: Date.now() - startedAt,
    provider: result.provider,
    title: result.diagnosis.title,
    immediateSteps: result.immediateSteps.length,
  };
}

async function main() {
  Object.assign(process.env, { NODE_ENV: "development" });
  process.env.DEMO_MODE = "false";
  const gmi = await verifyGmiConfiguration();
  const results = [
    await runMode("qwen"),
    await runMode("gmi"),
    await runMode("auto", true),
  ];
  console.log(JSON.stringify({ ok: true, gmi, results }));
}

void main().catch((error) => {
  console.error(
    JSON.stringify({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }),
  );
  process.exitCode = 1;
});
