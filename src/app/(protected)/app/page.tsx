import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RescueForm } from "@/components/rescue/rescue-form";
import { SessionList } from "@/components/rescue/session-list";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { RescueSession } from "@/lib/types/database";

export default async function AppPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("rescue_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="page-shell pb-20 pt-8 sm:pt-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)] lg:items-start">
        <section>
          <p className="eyebrow">You are not stuck</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">
            Something went wrong in Japan?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Tell Moshi what happened. We’ll help you understand what to do, who
            to approach, and what to say in Japanese.
          </p>
          <div className="mt-8">
            <RescueForm />
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Your records</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                Recent rescues
              </h2>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo hover:underline"
            >
              All history
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <SessionList sessions={(data ?? []) as RescueSession[]} />
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-indigo-soft/45 p-4 text-xs leading-5 text-muted">
            <strong className="text-ink">In immediate danger?</strong> Move to
            safety and contact nearby official staff or emergency services.
            Moshi is not an emergency service.
          </div>
        </aside>
      </div>
    </main>
  );
}
