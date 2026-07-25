"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Copy,
  ExternalLink,
  Info,
  Languages,
  LoaderCircle,
  Maximize2,
  MessageSquareText,
  ShieldAlert,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import type { ConversationOutput } from "@/lib/schemas/rescue";
import type { RescueSession } from "@/lib/types/database";
import { cn, formatDate } from "@/lib/utils";

function Section({
  eyebrow,
  title,
  icon,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-soft text-indigo">
          {icon}
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-indigo">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-ink">
            {title}
          </h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-muted transition hover:text-ink"
    >
      {copied ? (
        <Check className="size-4 text-success-text" />
      ) : (
        <Copy className="size-4" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function LanguageCard({
  japanese,
  romaji,
  english,
  onFullscreen,
  label = "Show this to staff",
}: {
  japanese: string;
  romaji?: string;
  english: string;
  onFullscreen: () => void;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-inverse text-white">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-coral-light">
          {label}
        </p>
        <p
          className="mt-4 whitespace-pre-line text-2xl font-semibold leading-[1.65] tracking-[-0.02em] sm:text-3xl"
          lang="ja"
        >
          {japanese}
        </p>
        {romaji && (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/58">
            {romaji}
          </p>
        )}
        <p className="mt-4 whitespace-pre-line border-t border-white/10 pt-4 text-sm leading-6 text-white/78">
          {english}
        </p>
      </div>
      <div className="flex gap-2 p-3">
        <CopyButton value={japanese} />
        <button
          type="button"
          onClick={onFullscreen}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-inverse-foreground px-3 text-xs font-semibold text-inverse"
        >
          <Maximize2 className="size-4" />
          Full screen for staff
        </button>
      </div>
    </div>
  );
}

function StaffDisplay({
  japanese,
  english,
  onClose,
}: {
  japanese: string;
  english: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-surface-raised p-5 sm:p-10"
      role="dialog"
      aria-modal="true"
      aria-label="Message for staff"
    >
      <div className="mx-auto flex min-h-full max-w-5xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-indigo">
            <Languages className="size-4" />
            Please show this screen to staff
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button border border-line bg-surface"
            aria-label="Close staff display"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="my-auto py-10">
          <p
            className="whitespace-pre-line text-[clamp(2rem,7vw,5.25rem)] font-semibold leading-[1.5] tracking-[-0.035em] text-ink"
            lang="ja"
          >
            {japanese}
          </p>
          <p className="mt-8 max-w-4xl whitespace-pre-line border-t border-line pt-7 text-base leading-7 text-muted sm:text-xl sm:leading-9">
            {english}
          </p>
        </div>
      </div>
    </div>
  );
}

export function RescueWorkspace({ session }: { session: RescueSession }) {
  const router = useRouter();
  const plan = session.rescue_plan;
  const [fullscreen, setFullscreen] = useState<{
    japanese: string;
    english: string;
  } | null>(null);
  const [staffMessage, setStaffMessage] = useState("");
  const [turns, setTurns] = useState(session.conversation_history ?? []);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = staffMessage.trim();
    if (!message) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rescueSessionId: session.id,
          staffMessage: message,
        }),
      });
      const data = (await response.json()) as ConversationOutput & {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Could not prepare a reply.");

      setTurns((current) => [
        ...current,
        {
          staffMessage: message,
          response: data,
          createdAt: new Date().toISOString(),
        },
      ]);
      setStaffMessage("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not prepare a reply. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleResolved() {
    setActionLoading(true);
    const nextStatus = session.status === "resolved" ? "active" : "resolved";
    const response = await fetch(`/api/rescue/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status: nextStatus }),
    });
    setActionLoading(false);
    if (response.ok) router.refresh();
  }

  async function deleteSession() {
    if (
      !window.confirm(
        "Delete this rescue plan and its conversation? This cannot be undone.",
      )
    )
      return;
    setActionLoading(true);
    const response = await fetch(`/api/rescue/${session.id}`, {
      method: "DELETE",
    });
    if (response.ok) router.replace("/history");
    else setActionLoading(false);
  }

  return (
    <>
      <main className="page-shell pb-24 pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/history"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            History
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={toggleResolved}
              className="button button-secondary"
            >
              {actionLoading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {session.status === "resolved" ? "Reopen" : "Mark resolved"}
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={deleteSession}
              className="icon-button border border-line bg-surface hover:text-coral-dark"
              aria-label="Delete rescue"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <header className="mt-6 rounded-[1.75rem] bg-primary p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/62">
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {session.category}
            </span>
            <span>{session.status}</span>
            <span>·</span>
            <time dateTime={session.created_at}>
              {formatDate(session.created_at)}
            </time>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {plan.diagnosis.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
            {plan.diagnosis.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              Urgency: {plan.diagnosis.urgency}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 capitalize">
              Provider: {session.provider_metadata?.name || "unknown"}
              {session.provider_metadata?.fallbackUsed ? " fallback" : ""}
              {session.provider_metadata?.fixtureUsed ? " · demo fixture" : ""}
            </span>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,.72fr)] lg:items-start">
          <div className="space-y-5">
            <Section
              eyebrow="01 · Do this now"
              title="Take these steps in order"
              icon={<ArrowRight className="size-5" />}
            >
              <ol className="space-y-4">
                {plan.immediateSteps.map((step) => (
                  <li className="flex gap-4" key={step.order}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-inverse font-mono text-xs font-bold text-white">
                      {step.order}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-6 text-ink">
                        {step.action}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {step.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section
              eyebrow="04 · Communicate"
              title="Open with this message"
              icon={<Languages className="size-5" />}
            >
              <LanguageCard
                {...plan.openingMessage}
                onFullscreen={() =>
                  setFullscreen({
                    japanese: plan.openingMessage.japanese,
                    english: plan.openingMessage.english,
                  })
                }
              />
            </Section>

            <Section
              eyebrow="Staff handoff"
              title="Give them the full context"
              icon={<ExternalLink className="size-5" />}
            >
              <LanguageCard
                japanese={plan.staffHandoffCard.japanese}
                english={plan.staffHandoffCard.english}
                label="Full summary for official staff"
                onFullscreen={() => setFullscreen(plan.staffHandoffCard)}
              />
            </Section>

            <Section
              eyebrow="05 · Be ready"
              title="What staff may ask"
              icon={<MessageSquareText className="size-5" />}
            >
              <div className="space-y-3">
                {plan.expectedQuestions.map((question) => (
                  <details
                    key={question.id}
                    className="group rounded-2xl border border-line bg-canvas/45"
                  >
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink" lang="ja">
                          {question.japanese}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {question.english}
                        </p>
                      </div>
                      <ChevronDown className="size-4 shrink-0 text-muted transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-line p-4">
                      <p className="text-xs leading-5 text-muted">
                        <strong className="text-ink">Why they ask:</strong>{" "}
                        {question.whyTheyAsk}
                      </p>
                      <div className="mt-4 rounded-xl bg-surface p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[.13em] text-indigo">
                          Suggested reply
                        </p>
                        <p className="mt-2 text-lg font-semibold leading-8" lang="ja">
                          {question.suggestedAnswerJapanese}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted">
                          {question.suggestedAnswerRomaji}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {question.suggestedAnswerEnglish}
                        </p>
                        <div className="mt-3">
                          <CopyButton value={question.suggestedAnswerJapanese} />
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Section>

            <Section
              eyebrow="06 · Continue"
              title="What did the staff member say?"
              icon={<MessageSquareText className="size-5" />}
            >
              {turns.length > 0 && (
                <div className="mb-5 space-y-4">
                  {turns.map((turn, index) => (
                    <div
                      key={`${turn.createdAt}-${index}`}
                      className="rounded-2xl border border-line bg-canvas/50 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[.13em] text-muted">
                        Staff message
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6">
                        {turn.staffMessage}
                      </p>
                      <div className="mt-4 rounded-xl bg-surface p-4">
                        <p className="text-xs leading-5 text-muted">
                          {turn.response.staffMeaning}
                        </p>
                        <p className="mt-3 text-xl font-semibold leading-8" lang="ja">
                          {turn.response.reply.japanese}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted">
                          {turn.response.reply.romaji}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {turn.response.reply.english}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <CopyButton value={turn.response.reply.japanese} />
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() =>
                              setFullscreen({
                                japanese: turn.response.reply.japanese,
                                english: turn.response.reply.english,
                              })
                            }
                          >
                            <Maximize2 className="size-4" />
                            Show staff
                          </button>
                        </div>
                        <div className="mt-4 border-t border-line pt-3 text-xs leading-5 text-muted">
                          <strong className="text-ink">Likely next:</strong>{" "}
                          {turn.response.likelyNextStep}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage}>
                <label className="field-label" htmlFor="staff-message">
                  Type or paste what you heard
                </label>
                <textarea
                  id="staff-message"
                  className="field min-h-28"
                  value={staffMessage}
                  onChange={(event) => setStaffMessage(event.target.value)}
                  placeholder="Japanese, romaji, or your best English description…"
                  maxLength={2000}
                  required
                />
                <p className="mt-2 text-xs leading-5 text-muted">
                  If you are unsure, enter the words you caught. Moshi will state
                  uncertainty rather than guess.
                </p>
                {error && (
                  <p className="mt-3 rounded-xl border border-coral/25 bg-coral/8 p-3 text-sm">
                    {error}
                  </p>
                )}
                <button
                  className="button button-primary mt-4 w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Preparing your reply…
                    </>
                  ) : (
                    <>
                      Prepare my next reply
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </Section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <Section
              eyebrow="02 · Who to approach"
              title="Find this person"
              icon={<UserRoundCheck className="size-5" />}
            >
              <p className="text-base font-semibold leading-7 text-ink">
                {plan.diagnosis.recommendedHelper}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Your goal: {plan.diagnosis.goal}
              </p>
            </Section>

            <Section
              eyebrow="03 · Prepare"
              title="Have these details ready"
              icon={<Clipboard className="size-5" />}
            >
              <ul className="divide-y divide-line">
                {plan.informationToPrepare.map((item) => (
                  <li className="py-4 first:pt-0 last:pb-0" key={item.label}>
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {item.whyNeeded}
                    </p>
                    {item.example && (
                      <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
                        Example: {item.example}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              eyebrow="07 · If that stalls"
              title="Fallback action"
              icon={<Info className="size-5" />}
            >
              <p className="text-sm leading-6 text-muted">{plan.fallbackAction}</p>
            </Section>

            <div className="rounded-2xl border border-coral/25 bg-coral/8 p-5">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-coral-dark" />
                <div>
                  <p className="text-sm font-semibold text-ink">Safety note</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {plan.safetyNote}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {fullscreen && (
        <StaffDisplay
          {...fullscreen}
          onClose={() => setFullscreen(null)}
        />
      )}
    </>
  );
}
