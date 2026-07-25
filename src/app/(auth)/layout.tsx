import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-canvas px-5 py-6 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="mt-8 rounded-[1.75rem] border border-line bg-surface p-6 shadow-card sm:p-8">
          {children}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-muted">
          Moshi is a travel guidance tool, not an emergency service.
        </p>
      </div>
    </main>
  );
}
