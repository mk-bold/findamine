"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Roster {
  id: string;
  name: string;
  created_at: string;
  roster_entries: { student_id: string }[];
}

export default function RostersPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchRosters() {
    const res = await fetch("/api/v1/roster");
    if (res.ok) {
      const data = await res.json();
      setRosters(data.rosters || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchRosters(); }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/v1/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      fetchRosters();
    }
    setCreating(false);
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-4"><p className="text-sm text-gray-500">Loading rosters...</p></main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <h1 className="text-base font-semibold text-gray-900 mb-3">Class Rosters</h1>
      <p className="text-xs text-gray-500 mb-4">
        Manage your class rosters. Use rosters to form teams for hunts.
      </p>

      {/* Create new roster */}
      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New roster name (e.g. Period 3 Science)"
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="btn-primary px-4 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Roster"}
        </button>
      </div>

      {/* Roster list */}
      {rosters.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No rosters yet. Create one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rosters.map((roster) => (
            <Link
              key={roster.id}
              href={`/dashboard/rosters/${roster.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-sky-200 hover:shadow-sm transition"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{roster.name}</p>
                <p className="text-xs text-gray-500">
                  {roster.roster_entries?.length || 0} student{(roster.roster_entries?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-gray-300 text-xs">View →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
