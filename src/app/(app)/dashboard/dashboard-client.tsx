"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const [counts, setCounts] = useState({ hunts: 0, teams: 0, badges: 0 });

  useEffect(() => {
    async function loadCounts() {
      try {
        const [huntsRes, badgesRes] = await Promise.all([
          fetch("/api/v1/hunts?mine=true"),
          fetch("/api/v1/badges?mine=true"),
        ]);
        const huntsData = huntsRes.ok ? await huntsRes.json() : { hunts: [] };
        const badgesData = badgesRes.ok ? await badgesRes.json() : { badges: [] };

        setCounts({
          hunts: (huntsData.hunts || []).length,
          teams: 0, // Teams count requires a dedicated endpoint; placeholder for now
          badges: (badgesData.badges || []).length,
        });
      } catch {
        // Keep defaults on error
      }
    }
    loadCounts();
  }, []);

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
          count={counts.hunts}
          href="/dashboard/hunts"
        />
        <DashboardCard
          title="My Teams"
          description="View and manage your teams"
          count={counts.teams}
          href="/dashboard/teams"
        />
        <DashboardCard
          title="Badges"
          description="Achievements you've earned"
          count={counts.badges}
          href="/dashboard/badges"
        />
        <DashboardCard
          title="Social"
          description="Friends, kudos, and more"
          count={0}
          href="/dashboard/social"
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
    <Link
      href={href}
      className="block card-themed shadow-sm hover:shadow-md transition-all"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-themed">{title}</h3>
        <span className="text-lg font-bold text-themed-primary">{count}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </Link>
  );
}
