"use client";

import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

interface StopData {
  id: string;
  order: number;
  clue_text: string | null;
  clue_hints: string[];
  location_name: string;
  lat: number;
  lng: number;
  radius_meters: number;
  challenge_type: string | null;
  challenge_title: string | null;
  primer_title: string | null;
  primer_text: string | null;
}

interface StopDetailModalProps {
  stop: StopData;
  onClose: () => void;
}

export default function StopDetailModal({ stop, onClose }: StopDetailModalProps) {
  const [showHints, setShowHints] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const hasCoords = stop.lat !== 0 && stop.lng !== 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Map header */}
        {hasCoords && isLoaded && (
          <div className="h-48 rounded-t-xl overflow-hidden">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: stop.lat, lng: stop.lng }}
              zoom={16}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              <Marker
                position={{ lat: stop.lat, lng: stop.lng }}
                label={{
                  text: String(stop.order),
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                  fillColor: "#ea580c",
                  fillOpacity: 0.9,
                  strokeColor: "#c2410c",
                  strokeWeight: 1,
                  scale: 1.8,
                  anchor: new google.maps.Point(12, 24),
                  labelOrigin: new google.maps.Point(12, 9),
                }}
              />
            </GoogleMap>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                  {stop.order}
                </span>
                <h2 className="text-base font-bold text-gray-900">{stop.location_name}</h2>
              </div>
              {stop.challenge_type && (
                <span className="text-xs text-sky-600">{stop.challenge_type.replace(/_/g, " ")}</span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>

          {/* Primer */}
          {stop.primer_title && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Primer: {stop.primer_title}</p>
              {stop.primer_text && (
                <p className="text-xs text-blue-900">{stop.primer_text}</p>
              )}
            </div>
          )}

          {/* Clue */}
          {stop.clue_text && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
              <p className="text-xs font-medium text-amber-700 mb-1">Clue</p>
              <p className="text-sm text-amber-900">{stop.clue_text}</p>
            </div>
          )}

          {/* Clue hints */}
          {stop.clue_hints.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {showHints ? "Hide" : "Show"} location hints ({stop.clue_hints.length})
              </button>
              {showHints && (
                <div className="mt-2 space-y-1.5">
                  {stop.clue_hints.map((hint, i) => (
                    <div key={i} className="rounded bg-indigo-50 border border-indigo-200 px-3 py-2">
                      <p className="text-[11px] font-medium text-indigo-700">Hint {i + 1}</p>
                      <p className="text-xs text-indigo-900">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Challenge */}
          {stop.challenge_title && (
            <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 mb-3">
              <p className="text-xs font-medium text-sky-700 mb-1">Challenge: {stop.challenge_title}</p>
            </div>
          )}

          {/* Location details */}
          {hasCoords && (
            <p className="text-[11px] text-gray-400">
              Location: {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)} · Radius: {stop.radius_meters}m
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Clickable stop list that opens the detail modal.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StopList({ finds }: { finds: any[] }) {
  const [selectedStop, setSelectedStop] = useState<StopData | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleClick(find: any, index: number) {
    const locations = find.locations;
    const tasks = find.tasks;
    const primers = find.primers;
    const clueHints = (find.clue_hints || []) as string[];

    setSelectedStop({
      id: find.id as string,
      order: index + 1,
      clue_text: find.clue_text as string | null,
      clue_hints: clueHints,
      location_name: locations?.name || `Stop ${index + 1}`,
      lat: locations?.latitude || 0,
      lng: locations?.longitude || 0,
      radius_meters: locations?.radius_meters || 50,
      challenge_type: tasks?.challenge_type || null,
      challenge_title: tasks?.title || null,
      primer_title: primers?.title || null,
      primer_text: typeof primers?.content === "object" ? (primers.content as Record<string, unknown>)?.text as string || null : null,
    });
  }

  return (
    <>
      <ol className="space-y-2">
        {finds.map((find, i) => {
          const locations = find.locations as { name: string } | null;
          const tasks = find.tasks as { title: string; challenge_type: string } | null;
          return (
            <li key={find.id as string}>
              <button
                onClick={() => handleClick(find, i)}
                className="w-full text-left flex gap-3 rounded-lg border border-gray-200 p-3 hover:border-sky-300 hover:bg-sky-50/50 transition"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-medium text-sky-700">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {locations?.name || `Stop ${i + 1}`}
                  </p>
                  {find.clue_text && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{find.clue_text as string}</p>
                  )}
                  {tasks && (
                    <span className="text-[11px] text-sky-600">
                      {tasks.challenge_type.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <span className="text-gray-300 text-xs ml-auto shrink-0">View →</span>
              </button>
            </li>
          );
        })}
      </ol>

      {selectedStop && (
        <StopDetailModal stop={selectedStop} onClose={() => setSelectedStop(null)} />
      )}
    </>
  );
}
