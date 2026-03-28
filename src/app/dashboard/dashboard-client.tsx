"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-emerald-800">Findamine</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.display_name || user.email}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.display_name || "explorer"}. Your adventure
          dashboard is being built.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="My Hunts"
            description="Create and manage scavenger hunts"
            count={0}
            href="/dashboard/hunts"
          />
          <DashboardCard
            title="My Teams"
            description="View and manage your teams"
            count={0}
            href="/dashboard/teams"
          />
          <DashboardCard
            title="Badges"
            description="Achievements you've earned"
            count={0}
            href="/dashboard/badges"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  count,
  href,
}: {
  title: string;
  description: string;
  count: number;
  href: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl font-bold text-emerald-600">{count}</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
