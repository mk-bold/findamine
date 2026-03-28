"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HuntActions({ huntId, status }: { huntId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    const endpoint = status === "published" ? "unpublish" : "publish";
    await fetch(`/api/v1/hunts/${huntId}/${endpoint}`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function handleClone() {
    setLoading(true);
    const res = await fetch(`/api/v1/hunts/${huntId}/clone`, { method: "POST" });
    const data = await res.json();
    if (data.hunt) {
      router.push(`/dashboard/hunts/${data.hunt.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePublish}
        disabled={loading}
        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
          status === "published"
            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        } disabled:opacity-50`}
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleClone}
        disabled={loading}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Clone
      </button>
    </div>
  );
}
