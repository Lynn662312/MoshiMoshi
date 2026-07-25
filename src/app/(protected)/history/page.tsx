import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SessionList } from "@/components/rescue/session-list";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { RescueSession } from "@/lib/types/database";

export const metadata = { title: "Rescue history" };

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("rescue_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="page-shell max-w-3xl pb-20 pt-8 sm:pt-12">
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        href="/app"
      >
        <ArrowLeft className="size-4" />
        Back to new rescue
      </Link>
      <p className="eyebrow mt-6">Saved for later</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">
        Rescue history
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Reopen a plan, continue the conversation, or clean up a resolved
        situation.
      </p>
      <div className="mt-8">
        <SessionList sessions={(data ?? []) as RescueSession[]} editable />
      </div>
    </main>
  );
}
