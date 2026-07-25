import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
        Continue your journey with a clear next step.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Sign in to reopen saved rescue plans and conversations.
      </p>
      <AuthForm mode="login" />
    </>
  );
}
