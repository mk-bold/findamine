"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InsightsPanel from "@/components/hunts/insights-panel";
import StreakDisplay from "@/components/gamification/streak-display";
import FeaturedHunts from "@/components/gamification/featured-hunts";
import { Map, Users, Award, Heart, Compass, ChevronRight } from "lucide-react";

interface DashboardUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

const GREETINGS = [
  "Ready for an adventure",
  "Welcome back, explorer",
  "Time to discover something new",
  "Your next adventure awaits",
  "The trail is calling",
];

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const [counts, setCounts] = useState({ hunts: 0, teams: 0, badges: 0 });
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

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
          teams: 0,
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
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-themed-text">
            {user.display_name ? `Hey, ${user.display_name}!` : "Hey there!"}
          </h1>
          <p className="font-[family-name:var(--font-handwritten)] text-lg text-themed-muted mt-0.5">
            {greeting} <Compass className="w-4 h-4 inline text-brand" />
          </p>
        </div>
        <StreakDisplay />
      </div>

      {/* Featured hunts */}
      <FeaturedHunts />

      {/* Quick action cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardCard
          title="My Hunts"
          description="Create and manage hunts"
          count={counts.hunts}
          href="/dashboard/hunts"
          icon={Map}
          gradient="from-sky-400 to-blue-500"
        />
        <DashboardCard
          title="My Teams"
          description="View your teams"
          count={counts.teams}
          href="/dashboard/teams"
          icon={Users}
          gradient="from-violet-400 to-purple-500"
        />
        <DashboardCard
          title="Badges"
          description="Achievements earned"
          count={counts.badges}
          href="/dashboard/badges"
          icon={Award}
          gradient="from-amber-400 to-orange-500"
        />
        <DashboardCard
          title="Social"
          description="Friends and kudos"
          count={0}
          href="/dashboard/social"
          icon={Heart}
          gradient="from-rose-400 to-pink-500"
        />
      </div>

      {/* Hunt creator insights */}
      {["teacher", "hunt_creator", "admin", "researcher"].includes(user.role) && (
        <div className="mt-2">
          <InsightsPanel />
        </div>
      )}
    </main>
  );
}

function DashboardCard({
  title,
  description,
  count,
  href,
  icon: Icon,
  gradient,
}: {
  title: string;
  description: string;
  count: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white border border-gray-100/80 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        {count > 0 && (
          <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand">
            {count}
          </span>
        )}
      </div>
      <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm text-gray-900 group-hover:text-brand transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      <div className="mt-2 flex items-center text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Open</span>
        <ChevronRight className="w-3 h-3 ml-0.5" />
      </div>
    </Link>
  );
}
