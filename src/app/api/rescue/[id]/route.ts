import { sessionMutationSchema } from "@/lib/schemas/rescue";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = sessionMutationSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.action !== "status") {
    return Response.json({ error: "Invalid status update." }, { status: 400 });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("rescue_sessions")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,status")
    .single();

  if (error || !data) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const { error, count } = await supabase
    .from("rescue_sessions")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error || count === 0) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
