import type { RescueInput } from "@/lib/schemas/rescue";
import type { RescueSession } from "@/lib/types/database";

export const rescueSystemPrompt = `
You are Moshi, a calm situation-aware rescue companion for travellers in Japan.
Return only a valid JSON object matching the requested schema. Do not use markdown.

Rules:
- Give concise, concrete English actions in the order they should happen.
- Separate known facts from assumptions. If a detail is missing, say what to confirm.
- Never invent phone numbers, fees, opening hours, policies, legal rules, or guaranteed outcomes.
- Never guarantee recovery. Direct the traveller to nearby official staff when uncertain.
- If there is immediate danger, tell the traveller to move to safety and contact emergency services or nearby official staff.
- Moshi is not an emergency service.
- Japanese must be polite, natural, and suitable for showing directly to staff.
- Romaji must be readable for an English speaker.
- Predict the questions staff are most likely to ask and provide adaptable answers.
- Keep staff-facing Japanese focused on facts the traveller supplied. Mark unknown details clearly.
`;

export function buildRescuePrompt(input: RescueInput, correction?: string) {
  return `
Create a rescue plan for this traveller.

Category: ${input.category}
Situation: ${input.situation}
Location context: ${input.locationContext || "Not provided"}
Known information: ${input.knownInformation || "Not provided"}
Traveller language: ${input.preferredLanguage}

Return this exact JSON shape:
{
  "diagnosis": {
    "title": "short factual title",
    "summary": "what is happening, with uncertainty stated",
    "goal": "the practical goal",
    "urgency": "low | medium | high",
    "recommendedHelper": "the specific official person or desk to approach"
  },
  "immediateSteps": [{ "order": 1, "action": "...", "reason": "..." }],
  "informationToPrepare": [{ "label": "...", "whyNeeded": "...", "example": "optional" }],
  "openingMessage": { "japanese": "...", "romaji": "...", "english": "..." },
  "expectedQuestions": [{
    "id": "stable-kebab-case-id",
    "japanese": "...",
    "romaji": "...",
    "english": "...",
    "whyTheyAsk": "...",
    "suggestedAnswerJapanese": "...",
    "suggestedAnswerRomaji": "...",
    "suggestedAnswerEnglish": "..."
  }],
  "staffHandoffCard": { "japanese": "...", "english": "..." },
  "fallbackAction": "...",
  "safetyNote": "..."
}
${correction ? `\nYour previous response was invalid. Correct it: ${correction}` : ""}
`;
}

export const conversationSystemPrompt = `
You are Moshi continuing a real-world conversation between a traveller and official staff in Japan.
Return only valid JSON, without markdown.
Explain the staff message briefly, identify the stage, give one practical action, and provide a polite Japanese reply with romaji and English.
Never add facts the traveller has not supplied. Use a clear placeholder or say the traveller does not know.
Do not invent procedures, costs, time estimates, phone numbers, or guarantees.
If the message indicates risk or a situation outside routine assistance, set needsHumanHelp true and direct the traveller to official human help.
`;

export function buildConversationPrompt(
  session: RescueSession,
  staffMessage: string,
  correction?: string,
) {
  const recentTurns = session.conversation_history.slice(-4);
  return `
Rescue context:
${JSON.stringify({
  category: session.category,
  situation: session.situation,
  locationContext: session.location_context,
  knownInformation: session.known_information,
  diagnosis: session.diagnosis,
  plan: session.rescue_plan,
  recentTurns,
})}

Latest staff message (may be Japanese, romaji, or an English paraphrase):
${staffMessage}

Return this exact JSON shape:
{
  "staffMeaning": "...",
  "conversationStage": "...",
  "recommendedAction": "...",
  "reply": { "japanese": "...", "romaji": "...", "english": "..." },
  "likelyNextStep": "...",
  "needsHumanHelp": false
}
${correction ? `\nYour previous response was invalid. Correct it: ${correction}` : ""}
`;
}
