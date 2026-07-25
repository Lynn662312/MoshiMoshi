import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <>
      <p className="eyebrow">Travel with a plan</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
        Make unfamiliar moments manageable.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Create an account to save each rescue plan and continue it when you need
        it.
      </p>
      <AuthForm mode="register" />
    </>
  );
}
