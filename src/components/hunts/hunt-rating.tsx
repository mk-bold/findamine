"use client";

import { useState, useEffect } from "react";

interface HuntRatingProps {
  huntId: string;
}

export default function HuntRating({ huntId }: HuntRatingProps) {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/hunts/${huntId}/rate`)
      .then((r) => r.json())
      .then((d) => {
        setAvgRating(d.avg_rating);
        setTotalRatings(d.total_ratings || 0);
      })
      .catch(() => {});
  }, [huntId]);

  async function handleSubmit() {
    if (userRating === 0) return;
    setSubmitting(true);
    try {
      await fetch(`/api/v1/hunts/${huntId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating, review_text: reviewText || null }),
      });
      setSubmitted(true);
      // Refresh ratings
      const res = await fetch(`/api/v1/hunts/${huntId}/rate`);
      const d = await res.json();
      setAvgRating(d.avg_rating);
      setTotalRatings(d.total_ratings);
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  const displayRating = hoverRating || userRating;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 mt-4">
      {/* Average rating display */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-sm ${avgRating && star <= Math.round(avgRating) ? "text-amber-400" : "text-gray-200"}`}>
              ★
            </span>
          ))}
        </div>
        {avgRating ? (
          <span className="text-xs text-gray-500">{avgRating} ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})</span>
        ) : (
          <span className="text-xs text-gray-400">No ratings yet</span>
        )}
      </div>

      {/* User rating input */}
      {!submitted ? (
        <div>
          <p className="text-xs text-gray-500 mb-1">Rate this hunt:</p>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(star)}
                className={`text-lg transition ${star <= displayRating ? "text-amber-400" : "text-gray-200"} hover:scale-110`}
              >
                ★
              </button>
            ))}
            {userRating > 0 && <span className="text-xs text-gray-500 ml-1">{userRating}/5</span>}
          </div>
          {userRating > 0 && (
            <>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                placeholder="Write a short review (optional)..."
                rows={2}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs mb-2"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary px-3 py-1 text-xs font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-green-600">Thanks for rating!</p>
      )}
    </div>
  );
}
