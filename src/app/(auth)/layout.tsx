import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-canvas px-5 py-6 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-[1.75rem] border border-line bg-white p-6 shadow-card sm:p-8">
          {children}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-muted">
          Moshi is a travel guidance tool, not an emergency service.
        </p>
      </div>
    </main>
  );
}
