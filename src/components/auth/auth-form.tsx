"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle, UserRound } from "lucide-react";
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
    const fullName = String(data.get("fullName") ?? "").trim();

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
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: fullName },
        },
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

  async function handleGuestLogin() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;

      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") ? next : "/app");
      router.refresh();
    } catch (caught) {
      const code =
        caught &&
        typeof caught === "object" &&
        "code" in caught &&
        typeof caught.code === "string"
          ? caught.code
          : "";
      const message =
        caught instanceof Error
          ? caught.message
          : "Guest access is unavailable right now.";
      setError(
        code === "anonymous_provider_disabled"
          ? "Guest access is not enabled yet. Enable anonymous sign-ins in Supabase Auth settings."
          : message,
      );
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {!isLogin && (
        <div>
          <label className="field-label" htmlFor="fullName">
            Name
          </label>
          <input
            className="field"
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="How should Moshi address you?"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
      )}
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

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        className="button button-secondary w-full"
        type="button"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        <UserRound className="size-4" />
        Continue as guest
      </button>
      <p className="text-center text-xs leading-5 text-muted">
        Guest rescue plans stay private on this device, but cannot be recovered
        after signing out or clearing browser data.
      </p>

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
