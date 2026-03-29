"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  status: string;
  created_at: string;
  users: { display_name: string | null } | null;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/moderation?status=pending");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleReview = async (reportId: string, status: "approved" | "rejected") => {
    await fetch(`/api/v1/moderation/${reportId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/admin" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; Admin
      </Link>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Moderation Queue</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
          No pending reports. All clear.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.entity_type} report</p>
                  <p className="text-sm text-gray-600 mt-1">{r.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(r.id, "approved")}
                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(r.id, "rejected")}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
