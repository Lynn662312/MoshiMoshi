import type {
  ConversationOutput,
  ExplanationLanguage,
  RescueCategory,
  RescuePlan,
} from "@/lib/schemas/rescue";

export type RescueStatus = "active" | "resolved" | "archived";

export type ConversationTurn = {
  staffMessage: string;
  response: ConversationOutput;
  createdAt: string;
};

export type RescueSession = {
  id: string;
  user_id: string;
  category: RescueCategory;
  situation: string;
  location_context: string | null;
  known_information: string | null;
  preferred_language: ExplanationLanguage;
  status: RescueStatus;
  diagnosis: RescuePlan["diagnosis"];
  rescue_plan: RescuePlan;
  conversation_history: ConversationTurn[];
  provider_metadata: {
    name: "qwen" | "gmi";
    fallbackUsed: boolean;
    fixtureUsed?: boolean;
  };
  created_at: string;
  updated_at: string;
};
