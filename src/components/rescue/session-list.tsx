"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Trash2,
} from "lucide-react";
import type { RescueSession } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

const categoryLabels = {
  locker: "Locker & belongings",
  transport: "Station & transport",
  hotel: "Hotel & reservation",
  other: "Other situation",
};

export function SessionList({
  sessions,
  editable = false,
}: {
  sessions: RescueSession[];
  editable?: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: "resolved" | "active") {
    setBusyId(id);
    setError("");
    const response = await fetch(`/api/rescue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Could not update this rescue.");
    } else {
      router.refresh();
    }
    setBusyId("");
  }

  async function deleteSession(id: string) {
    if (
      !window.confirm(
        "Delete this rescue plan and its conversation? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusyId(id);
    setError("");
    const response = await fetch(`/api/rescue/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Could not delete this rescue.");
    } else {
      router.refresh();
    }
    setBusyId("");
  }

  if (!sessions.length) {
    return (
      <div className="surface px-5 py-10 text-center">
        <p className="text-sm font-semibold text-ink">No rescue plans yet</p>
        <p className="mt-1 text-sm text-muted">
          Your saved situations will appear here.
        </p>
        <Link className="button button-primary mt-5" href="/app">
          Start a rescue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl border border-coral/25 bg-coral/8 p-3 text-sm">
          {error}
        </p>
      )}
      {sessions.map((session) => (
        <article className="surface overflow-hidden" key={session.id}>
          <Link
            href={`/rescue/${session.id}`}
            className="block p-5 transition hover:bg-indigo-soft/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[.14em] text-indigo">
                    {categoryLabels[session.category]}
                  </span>
                  <span
                    className={
                      session.status === "resolved"
                        ? "rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-success"
                        : "rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-coral-dark"
                    }
                  >
                    {session.status}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-base font-semibold tracking-[-0.025em] text-ink">
                  {session.diagnosis?.title || "Saved rescue"}
                </h3>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted" />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {session.location_context && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {session.location_context}
                </span>
              )}
              <time dateTime={session.created_at}>
                {formatDate(session.created_at)}
              </time>
              <span className="capitalize">
                {session.provider_metadata?.name || "provider unknown"}
                {session.provider_metadata?.fallbackUsed ? " fallback" : ""}
                {session.provider_metadata?.fixtureUsed ? " demo fixture" : ""}
              </span>
            </div>
          </Link>
          {editable && (
            <div className="flex border-t border-line">
              <button
                className="flex min-h-12 flex-1 items-center justify-center gap-2 text-xs font-semibold text-muted transition hover:bg-indigo-soft/35 hover:text-indigo"
                disabled={busyId === session.id}
                onClick={() =>
                  updateStatus(
                    session.id,
                    session.status === "resolved" ? "active" : "resolved",
                  )
                }
              >
                {busyId === session.id ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {session.status === "resolved" ? "Mark active" : "Mark resolved"}
              </button>
              <button
                className="flex min-h-12 flex-1 items-center justify-center gap-2 border-l border-line text-xs font-semibold text-muted transition hover:bg-coral/8 hover:text-coral-dark"
                disabled={busyId === session.id}
                onClick={() => deleteSession(session.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
