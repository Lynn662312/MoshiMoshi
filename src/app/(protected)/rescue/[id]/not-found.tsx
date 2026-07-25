import Link from "next/link";

export default function RescueNotFound() {
  return (
    <main className="page-shell grid min-h-[70dvh] place-items-center py-16 text-center">
      <div>
        <p className="eyebrow">Rescue not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
          This plan is unavailable.
        </h1>
        <p className="mt-3 text-sm text-muted">
          It may have been deleted, or it belongs to another account.
        </p>
        <Link className="button button-primary mt-6" href="/history">
          Open rescue history
        </Link>
      </div>
    </main>
  );
}
