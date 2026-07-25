import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Languages,
  ListChecks,
  MessageSquareText,
  Route,
  ShieldCheck,
  TrainFront,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

const workflow = [
  {
    icon: ListChecks,
    number: "01",
    title: "Understand the situation",
    copy: "Moshi identifies the real goal, urgency, and details that are still missing.",
  },
  {
    icon: Route,
    number: "02",
    title: "Find the next clear step",
    copy: "See who to approach, what to prepare, and what to do in the right order.",
  },
  {
    icon: MessageSquareText,
    number: "03",
    title: "Continue the conversation",
    copy: "Show natural Japanese, anticipate staff questions, and adapt each reply.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-canvas">
      <section className="relative border-b border-line">
        <div className="landing-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <header className="page-shell relative flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link className="button button-ghost hidden sm:inline-flex" href="/login">
              Log in
            </Link>
            <Link className="button button-primary" href="/register">
              Get Moshi
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <div className="page-shell relative grid gap-12 pb-20 pt-10 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <div className="eyebrow-chip">
              <TrainFront className="size-3.5" />
              Japan rescue companion
            </div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3.25rem,9vw,6.8rem)] font-semibold leading-[.88] tracking-[-0.075em] text-ink">
              The next
              <span className="block text-indigo">clear step.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              When something goes wrong in Japan, Moshi helps you understand
              what to do, who to approach, and what to say—without the panic.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button button-primary button-large" href="/register">
                Start with Moshi
                <ArrowRight className="size-5" />
              </Link>
              <Link className="button button-secondary button-large" href="/login">
                I have an account
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" />
                Saved privately
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="size-4 text-success" />
                Japanese + romaji
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-success" />
                Built for real situations
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem] lg:justify-self-end">
            <div className="absolute -left-12 top-12 size-32 rounded-full bg-coral/20 blur-3xl" />
            <div className="absolute -right-12 bottom-10 size-40 rounded-full bg-indigo/20 blur-3xl" />
            <div className="relative rotate-[1.5deg] rounded-[2rem] border border-indigo/10 bg-indigo p-3 shadow-float">
              <div className="overflow-hidden rounded-[1.45rem] bg-[#f9f7f1]">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <Logo href="/" compact />
                  <span className="rounded-full bg-coral/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-coral-dark">
                    Active rescue
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo">
                    Station locker · Tokyo
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">
                    Lost IC card linked to a locker
                  </h2>
                  <div className="mt-5 rounded-2xl border border-line bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-success">
                      Do this now
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-ink">
                      Photograph the locker bank, then go to the nearest staffed
                      ticket gate.
                    </p>
                  </div>
                  <div className="mt-3 rounded-2xl bg-ink p-5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/55">
                      Show this to station staff
                    </p>
                    <p className="mt-3 text-xl font-semibold leading-8 tracking-[-0.02em]">
                      交通系ICカードをなくして、ロッカーを開けられません。
                    </p>
                    <p className="mt-3 text-xs leading-5 text-white/60">
                      Kōtsū-kei IC kādo o nakushite, rokkā o akeraremasen.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo">
                    <MessageSquareText className="size-4" />
                    Prepare the next reply
                    <ArrowRight className="ml-auto size-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="eyebrow">More than translation</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">
              Words are only one part of getting unstuck.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {workflow.map((item) => (
              <article
                className="rounded-3xl border border-line bg-white p-5 sm:min-h-64"
                key={item.number}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-indigo-soft text-indigo">
                    <item.icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">{item.number}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-[-0.03em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="page-shell grid gap-8 py-16 sm:grid-cols-[1fr_auto] sm:items-center sm:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.17em] text-coral-light">
              From language panic to the next clear step
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Keep a calm plan in your pocket for the moments you did not plan.
            </h2>
          </div>
          <Link className="button bg-white text-ink hover:bg-white/90" href="/register">
            Create your account
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="page-shell flex flex-col gap-3 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <Logo compact />
        <p>Moshi is not an emergency service. Seek official help in immediate danger.</p>
      </footer>
    </main>
  );
}
