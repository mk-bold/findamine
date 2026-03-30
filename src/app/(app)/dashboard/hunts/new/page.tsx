"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHuntPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/v1/hunts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        target_audience: form.get("target_audience"),
        play_mode: form.get("play_mode"),
        identity_mode: form.get("identity_mode"),
        estimated_duration_min: form.get("duration") ? parseInt(form.get("duration") as string) : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create hunt");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/hunts/${data.hunt.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Create New Hunt</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Hunt Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="e.g. BYU Campus Discovery Walk"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Describe what players will experience..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
              Audience
            </label>
            <select
              id="target_audience"
              name="target_audience"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="kids">Kids (7-12)</option>
              <option value="teens">Teens (13-17)</option>
              <option value="adults">Adults</option>
              <option value="family">Family</option>
            </select>
          </div>

          <div>
            <label htmlFor="play_mode" className="block text-sm font-medium text-gray-700">
              Play Mode
            </label>
            <select
              id="play_mode"
              name="play_mode"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="solo">Solo</option>
              <option value="team_self_select">Teams (self-select)</option>
              <option value="team_random">Teams (random)</option>
              <option value="team_assigned">Teams (assigned)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="identity_mode" className="block text-sm font-medium text-gray-700">
            Leaderboard Identity
          </label>
          <select
            id="identity_mode"
            name="identity_mode"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="codename_assigned">Random Codenames (default, most private)</option>
            <option value="codename_chosen">Player-Chosen Names</option>
            <option value="real_name">Real Names</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Controls how players appear on leaderboards. Children&apos;s names are always protected.
          </p>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Estimated Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            min={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Hunt"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
