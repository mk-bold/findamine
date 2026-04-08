"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/v1/admin/users${q}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
      setLoading(false);
    }
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      <Link href="/admin" className="text-sm text-brand hover:underline mb-4 inline-block">
        &larr; Admin
      </Link>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">User Management</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="mb-4 block w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      />

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{u.display_name || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">{u.role}</span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{u.status || "active"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
