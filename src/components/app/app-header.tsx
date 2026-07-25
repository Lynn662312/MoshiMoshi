import Link from "next/link";
import { History, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppHeader({
  email,
  isGuest = false,
}: {
  email?: string;
  isGuest?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/90 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-3">
        <Logo href="/app" />
        <nav className="flex items-center gap-1" aria-label="Account navigation">
          <ThemeToggle className="mr-1" />
          {isGuest && (
            <span className="mr-1 hidden rounded-full bg-indigo-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-indigo sm:inline-flex">
              Guest
            </span>
          )}
          <Link className="icon-button" href="/history" aria-label="Rescue history">
            <History className="size-5" />
          </Link>
          <form action={logout}>
            <button
              className="icon-button"
              aria-label={
                isGuest
                  ? "End guest session"
                  : `Sign out${email ? ` ${email}` : ""}`
              }
            >
              <LogOut className="size-5" />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
