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
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, {user.display_name || "explorer"}.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    <a href={href} className="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-200 transition-all">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <span className="text-lg font-bold text-sky-600">{count}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </a>
  );
}
