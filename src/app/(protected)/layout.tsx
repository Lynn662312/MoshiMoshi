import { AppHeader } from "@/components/app/app-header";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh bg-canvas">
      <AppHeader email={user.email} />
      {children}
    </div>
  );
}
