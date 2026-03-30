"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ display_name: string; email: string; role: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/auth/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setDisplayName(data.user.display_name || "");
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/v1/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }),
    });

    if (res.ok) {
      setMessage("Saved!");
    } else {
      setMessage("Failed to save.");
    }
    setSaving(false);
  }

  if (!user) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">Loading...</main>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="mt-1 text-sm text-gray-500">{user.role}</p>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {message && (
          <p className={`text-sm ${message === "Saved!" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </main>
  );
}
