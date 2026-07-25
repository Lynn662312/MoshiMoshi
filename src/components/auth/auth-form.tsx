"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");
  const [message, setMessage] = useState("");
  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    try {
      const supabase = createClient();

      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        const next = searchParams.get("next");
        router.replace(next?.startsWith("/") ? next : "/app");
        router.refresh();
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback?next=/app`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (authError) throw authError;

      if (authData.session) {
        router.replace("/app");
        router.refresh();
      } else {
        setMessage(
          "Check your email to confirm your account, then return here to sign in.",
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not complete that request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          className="field"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          {!isLogin && (
            <span className="text-xs text-muted">At least 8 characters</span>
          )}
        </div>
        <input
          className="field"
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </div>

      {error && (
        <p className="rounded-xl border border-coral/25 bg-coral/8 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-success/25 bg-success/8 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      )}

      <button className="button button-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            {isLogin ? "Signing in…" : "Creating account…"}
          </>
        ) : (
          <>
            {isLogin ? "Sign in" : "Create account"}
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted">
        {isLogin ? "New to Moshi?" : "Already have an account?"}{" "}
        <Link
          className="font-semibold text-indigo hover:underline"
          href={isLogin ? "/register" : "/login"}
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
