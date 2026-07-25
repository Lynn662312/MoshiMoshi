"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BedDouble,
  Box,
  Check,
  LoaderCircle,
  MessageCircleQuestion,
  TrainFront,
} from "lucide-react";
import {
  LOCKER_DEMO_KNOWN,
  LOCKER_DEMO_LOCATION,
  LOCKER_DEMO_SITUATION,
} from "@/lib/ai/demo-fixture";
import type { RescueCategory } from "@/lib/schemas/rescue";
import { cn } from "@/lib/utils";

const categories = [
  {
    value: "locker" as const,
    label: "Locker or belongings",
    hint: "Lost item, locker, luggage",
    icon: Box,
  },
  {
    value: "transport" as const,
    label: "Station or transport",
    hint: "Train, ticket, route, delay",
    icon: TrainFront,
  },
  {
    value: "hotel" as const,
    label: "Hotel or reservation",
    hint: "Check-in, booking, room",
    icon: BedDouble,
  },
  {
    value: "other" as const,
    label: "Another situation",
    hint: "Describe what happened",
    icon: MessageCircleQuestion,
  },
];

const loadingSteps = [
  "Understanding the situation",
  "Identifying the right helper",
  "Preparing your information",
  "Building the Japanese conversation",
];

export function RescueForm() {
  const router = useRouter();
  const [category, setCategory] = useState<RescueCategory>("locker");
  const [situation, setSituation] = useState("");
  const [locationContext, setLocationContext] = useState("");
  const [knownInformation, setKnownInformation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;
    const interval = window.setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 1200);
    return () => window.clearInterval(interval);
  }, [loading]);

  const selected = useMemo(
    () => categories.find((item) => item.value === category),
    [category],
  );

  function loadDemo() {
    setCategory("locker");
    setSituation(LOCKER_DEMO_SITUATION);
    setLocationContext(LOCKER_DEMO_LOCATION);
    setKnownInformation(LOCKER_DEMO_KNOWN);
    setError("");
    window.setTimeout(
      () => document.getElementById("situation")?.focus(),
      50,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError("");

    try {
      const response = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          situation,
          locationContext,
          knownInformation,
          preferredLanguage: "English",
        }),
      });
      const data = (await response.json()) as {
        rescueSessionId?: string;
        error?: string;
      };

      if (!response.ok || !data.rescueSessionId) {
        throw new Error(data.error || "Moshi could not prepare the plan.");
      }

      router.push(`/rescue/${data.rescueSessionId}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Moshi could not prepare the plan. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((item) => {
          const active = item.value === category;
          return (
            <button
              type="button"
              key={item.value}
              onClick={() => setCategory(item.value)}
              className={cn(
                "min-h-32 rounded-2xl border p-4 text-left transition sm:min-h-36",
                active
                  ? "border-indigo bg-indigo text-white shadow-card"
                  : "border-line bg-white hover:border-indigo/30",
              )}
              aria-pressed={active}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-xl",
                  active ? "bg-white/12" : "bg-indigo-soft text-indigo",
                )}
              >
                <item.icon className="size-5" />
              </span>
              <span className="mt-4 block text-sm font-semibold leading-5">
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-1 block text-[11px] leading-4",
                  active ? "text-white/65" : "text-muted",
                )}
              >
                {item.hint}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={loadDemo}
        className="mt-3 flex min-h-12 w-full items-center justify-between rounded-2xl border border-coral/25 bg-coral/8 px-4 text-left text-sm font-semibold text-ink transition hover:bg-coral/12"
      >
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-coral" />
          Try the lost IC card locker case
        </span>
        <ArrowRight className="size-4 text-coral-dark" />
      </button>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="situation">
            What happened?
          </label>
          <textarea
            className="field"
            id="situation"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            placeholder={`Describe the ${selected?.label.toLowerCase()} problem in your own words…`}
            minLength={12}
            maxLength={3000}
            required
          />
          <p className="mt-2 text-xs leading-5 text-muted">
            Include what you were trying to do and what stopped you.
          </p>
        </div>
        <div>
          <label className="field-label" htmlFor="location">
            Where are you? <span className="font-normal text-muted">Optional</span>
          </label>
          <input
            className="field"
            id="location"
            value={locationContext}
            onChange={(event) => setLocationContext(event.target.value)}
            placeholder="Station, exit, platform, hotel…"
            maxLength={500}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="known">
            What do you already know?{" "}
            <span className="font-normal text-muted">Optional</span>
          </label>
          <textarea
            className="field min-h-24"
            id="known"
            value={knownInformation}
            onChange={(event) => setKnownInformation(event.target.value)}
            placeholder="Times, booking numbers, item description, receipts…"
            maxLength={1500}
          />
        </div>

        {error && (
          <div
            className="rounded-2xl border border-coral/25 bg-coral/8 p-4"
            role="alert"
          >
            <p className="text-sm font-semibold text-ink">
              We could not build that plan
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">{error}</p>
            <button
              type="submit"
              className="mt-2 text-sm font-semibold text-indigo hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <button
          className="button button-primary button-large w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              Preparing your rescue plan…
            </>
          ) : (
            <>
              Help me handle this
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
      </form>

      {loading && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm rounded-[1.75rem] bg-canvas p-6 shadow-float">
            <div className="grid size-12 place-items-center rounded-2xl bg-indigo text-white">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-ink">
              Building your next steps
            </h2>
            <div className="mt-5 space-y-3">
              {loadingSteps.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-3 text-sm",
                    index <= loadingStep ? "text-ink" : "text-muted/45",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full",
                      index < loadingStep
                        ? "bg-success text-white"
                        : index === loadingStep
                          ? "bg-indigo-soft text-indigo"
                          : "border border-line",
                    )}
                  >
                    {index < loadingStep ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
