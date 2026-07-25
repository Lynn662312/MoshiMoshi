import Link from "next/link";
import { History, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/90 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-3">
        <Logo href="/app" />
        <nav className="flex items-center gap-1" aria-label="Account navigation">
          <Link className="icon-button" href="/history" aria-label="Rescue history">
            <History className="size-5" />
          </Link>
          <form action={logout}>
            <button className="icon-button" aria-label={`Sign out${email ? ` ${email}` : ""}`}>
              <LogOut className="size-5" />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
