import { generateConversation } from "@/lib/ai/generate";
import { conversationInputSchema } from "@/lib/schemas/rescue";
import { createClient } from "@/lib/supabase/server";
import type { RescueSession } from "@/lib/types/database";
import { getErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const parsed = conversationInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Please enter the staff message again." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("rescue_sessions")
      .select("*")
      .eq("id", parsed.data.rescueSessionId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return Response.json({ error: "Rescue session not found." }, { status: 404 });
    }

    const session = data as RescueSession;
    const response = await generateConversation(
      session,
      parsed.data.staffMessage,
    );
    const conversationHistory = [
      ...(session.conversation_history ?? []),
      {
        staffMessage: parsed.data.staffMessage,
        response,
        createdAt: new Date().toISOString(),
      },
    ];

    const { error: updateError } = await supabase
      .from("rescue_sessions")
      .update({ conversation_history: conversationHistory })
      .eq("id", session.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to save conversation turn", updateError);
      return Response.json(
        { error: "The reply was prepared but could not be saved. Please retry." },
        { status: 500 },
      );
    }

    return Response.json(response);
  } catch (error) {
    console.error("POST /api/conversation failed", error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
