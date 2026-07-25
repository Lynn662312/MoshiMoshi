import { notFound } from "next/navigation";
import { RescueWorkspace } from "@/components/rescue/rescue-workspace";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { RescueSession } from "@/lib/types/database";

export const metadata = { title: "Rescue plan" };

export default async function RescuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rescue_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  return <RescueWorkspace session={data as RescueSession} />;
}
