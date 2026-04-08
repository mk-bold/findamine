"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface RosterMember {
  student_id: string;
  added_at: string;
  users: { id: string; display_name: string | null; email: string; role: string } | null;
}

interface Roster {
  id: string;
  name: string;
  roster_entries: RosterMember[];
}

export default function RosterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [roster, setRoster] = useState<Roster | null>(null);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchRoster = useCallback(async () => {
    const res = await fetch(`/api/v1/roster/${id}`);
    if (res.ok) {
      const data = await res.json();
      setRoster(data.roster);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  async function handleAddMember() {
    if (!addEmail.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch(`/api/v1/roster/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addEmail.trim() }),
    });
    if (res.ok) {
      setAddEmail("");
      fetchRoster();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add student");
    }
    setAdding(false);
  }

  async function handleRemoveMember(studentId: string) {
    if (!confirm("Remove this student from the roster?")) return;
    await fetch(`/api/v1/roster/${id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    });
    fetchRoster();
  }

  async function handleDeleteRoster() {
    if (!confirm("Delete this roster? This cannot be undone.")) return;
    await fetch(`/api/v1/roster/${id}`, { method: "DELETE" });
    router.push("/dashboard/rosters");
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-4"><p className="text-sm text-gray-500">Loading...</p></main>;
  }

  if (!roster) {
    return <main className="mx-auto max-w-3xl px-4 py-4"><p className="text-sm text-gray-500">Roster not found.</p></main>;
  }

  const members = roster.roster_entries || [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <Link href="/dashboard/rosters" className="text-sm text-brand hover:underline mb-3 inline-block">
        &larr; All Rosters
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-base font-bold text-gray-900">{roster.name}</h1>
          <p className="text-xs text-gray-500">{members.length} student{members.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={handleDeleteRoster}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Delete Roster
        </button>
      </div>

      {/* Add student */}
      <div className="flex gap-2 mb-4">
        <input
          value={addEmail}
          onChange={(e) => setAddEmail(e.target.value)}
          placeholder="Student email address"
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
        />
        <button
          onClick={handleAddMember}
          disabled={adding || !addEmail.trim()}
          className="bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors px-4 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Student"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 mb-3">{error}</div>
      )}

      {/* Student list */}
      {members.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No students yet. Add students by email above.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {members.map((m) => (
            <div key={m.student_id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div>
                <p className="text-sm text-gray-900">
                  {m.users?.display_name || m.users?.email || "Unknown"}
                </p>
                {m.users?.email && m.users?.display_name && (
                  <p className="text-[11px] text-gray-500">{m.users.email}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveMember(m.student_id)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team formation section */}
      {members.length >= 2 && (
        <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Form Teams</h2>
          <p className="text-xs text-gray-500 mb-3">
            Assign these {members.length} students to teams for a hunt.
          </p>
          <Link
            href={`/dashboard/rosters/${id}?form_teams=true`}
            className="bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors px-4 py-1.5 text-sm font-medium inline-block"
          >
            Form Teams for a Hunt
          </Link>
        </div>
      )}
    </main>
  );
}
