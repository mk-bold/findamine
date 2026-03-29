"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FindEditor from "@/components/hunts/find-editor";

interface HuntDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  target_audience: string;
  play_mode: string;
  identity_mode: string;
  estimated_duration_min: number | null;
  finds: FindItem[];
}

interface FindItem {
  id: string;
  sort_order: number;
  clue_text: string | null;
  locations: { name: string; latitude: number; longitude: number } | null;
  tasks: { title: string; challenge_type: string } | null;
  primers: { title: string } | null;
}

export default function HuntDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hunt, setHunt] = useState<HuntDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const fetchHunt = useCallback(async () => {
    const res = await fetch(`/api/v1/hunts/${id}`);
    if (!res.ok) {
      setError("Hunt not found");
      setLoading(false);
      return;
    }
    const data = await res.json();
    const h = data.hunt;
    // Sort finds
    if (h.finds) {
      h.finds.sort((a: FindItem, b: FindItem) => a.sort_order - b.sort_order);
    }
    setHunt(h);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchHunt();
  }, [fetchHunt]);

  const handlePublish = async () => {
    if (!hunt) return;
    setActionLoading(true);
    const endpoint = hunt.status === "published" ? "unpublish" : "publish";
    await fetch(`/api/v1/hunts/${hunt.id}/${endpoint}`, { method: "POST" });
    await fetchHunt();
    setActionLoading(false);
  };

  const handleClone = async () => {
    if (!hunt) return;
    setActionLoading(true);
    const res = await fetch(`/api/v1/hunts/${hunt.id}/clone`, { method: "POST" });
    const data = await res.json();
    if (data.hunt) {
      router.push(`/dashboard/hunts/${data.hunt.id}`);
    }
    setActionLoading(false);
  };

  const handleDeleteFind = async (findId: string) => {
    if (!confirm("Remove this stop from the hunt?")) return;
    await fetch(`/api/v1/hunts/${id}/finds/${findId}`, { method: "DELETE" });
    await fetchHunt();
  };

  const handleMoveFind = async (findId: string, direction: "up" | "down") => {
    if (!hunt) return;
    const finds = [...hunt.finds];
    const idx = finds.findIndex((f) => f.id === findId);
    if (idx < 0) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= finds.length) return;

    // Swap sort_order values
    const thisOrder = finds[idx].sort_order;
    const otherOrder = finds[targetIdx].sort_order;

    await Promise.all([
      fetch(`/api/v1/hunts/${id}/finds/${finds[idx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: otherOrder }),
      }),
      fetch(`/api/v1/hunts/${id}/finds/${finds[targetIdx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: thisOrder }),
      }),
    ]);

    await fetchHunt();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!hunt) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center text-gray-500">
        {error || "Hunt not found"}
      </main>
    );
  }

  const isDraft = hunt.status === "draft";
  const finds = hunt.finds || [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/dashboard/hunts" className="text-sm text-sky-600 hover:underline mb-4 inline-block">
        &larr; My Hunts
      </Link>

      {/* Hunt header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{hunt.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              hunt.status === "published"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {hunt.status}
            </span>
            <span className="text-xs text-gray-400">{hunt.target_audience}</span>
            <span className="text-xs text-gray-400">{hunt.play_mode.replace(/_/g, " ")}</span>
            <span className="text-xs text-gray-400">
              {hunt.identity_mode === "codename_assigned"
                ? "Random codenames"
                : hunt.identity_mode === "codename_chosen"
                ? "Player-chosen names"
                : "Real names"}
            </span>
            {hunt.estimated_duration_min && (
              <span className="text-xs text-gray-400">{hunt.estimated_duration_min} min</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePublish}
            disabled={actionLoading}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              hunt.status === "published"
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-sky-600 text-white hover:bg-sky-700"
            } disabled:opacity-50`}
          >
            {hunt.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleClone}
            disabled={actionLoading}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Clone
          </button>
        </div>
      </div>

      {hunt.description && (
        <p className="text-gray-600 mb-8">{hunt.description}</p>
      )}

      {/* Finds section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Stops ({finds.length})
          </h2>
          {isDraft && !showEditor && (
            <button
              onClick={() => setShowEditor(true)}
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              + Add Stop
            </button>
          )}
        </div>

        {finds.length === 0 && !showEditor && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400 mb-3">No stops yet. Add your first stop to start building the hunt.</p>
            {isDraft && (
              <button
                onClick={() => setShowEditor(true)}
                className="rounded-md bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Add First Stop
              </button>
            )}
          </div>
        )}

        {finds.length > 0 && (
          <div className="space-y-3">
            {finds.map((find, i) => (
              <div key={find.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                {/* Number badge */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-medium text-sky-700">
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {find.locations?.name || `Stop ${i + 1}`}
                  </p>
                  {find.clue_text && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{find.clue_text}</p>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {find.tasks && (
                      <span className="text-xs bg-sky-50 text-sky-700 rounded px-1.5 py-0.5">
                        {find.tasks.challenge_type.replace(/_/g, " ")}
                      </span>
                    )}
                    {find.primers && (
                      <span className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">
                        has primer
                      </span>
                    )}
                    {find.locations && (
                      <span className="text-xs text-gray-400">
                        {find.locations.latitude.toFixed(4)}, {find.locations.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isDraft && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveFind(find.id, "up")}
                      disabled={i === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveFind(find.id, "down")}
                      disabled={i === finds.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleDeleteFind(find.id)}
                      className="text-gray-400 hover:text-red-500 text-xs mt-1"
                      aria-label="Delete"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Find editor (inline) */}
        {showEditor && (
          <div className="mt-4">
            <FindEditor
              huntId={hunt.id}
              onSaved={() => {
                setShowEditor(false);
                fetchHunt();
              }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
