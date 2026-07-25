import { generateRescue } from "@/lib/ai/generate";
import { rescueInputSchema } from "@/lib/schemas/rescue";
import { createClient } from "@/lib/supabase/server";
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

    const parsed = rescueInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Please check the situation details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await generateRescue(parsed.data);
    const { provider, ...plan } = result;
    const { data: session, error } = await supabase
      .from("rescue_sessions")
      .insert({
        user_id: user.id,
        category: parsed.data.category,
        situation: parsed.data.situation,
        location_context: parsed.data.locationContext || null,
        known_information: parsed.data.knownInformation || null,
        diagnosis: result.diagnosis,
        rescue_plan: plan,
        provider_metadata: provider,
      })
      .select("id")
      .single();

    if (error || !session) {
      console.error("Failed to save rescue session", error);
      return Response.json(
        {
          error:
            "The plan was prepared but could not be saved. Please verify the Supabase migration and try again.",
        },
        { status: 500 },
      );
    }

    return Response.json({ rescueSessionId: session.id, ...result });
  } catch (error) {
    console.error("POST /api/rescue failed", error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
