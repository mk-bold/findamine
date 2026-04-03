"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

interface Stop {
  order: number;
  name: string;
  lat: number;
  lng: number;
}

interface HuntMapProps {
  centerLat: number | null;
  centerLng: number | null;
  stops: Stop[];
}

const MAP_STYLES = { width: "100%", height: "280px" };

export default function HuntMap({ centerLat, centerLng, stops }: HuntMapProps) {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // If no stops with coordinates and no center, don't render
  if (stops.length === 0 && !centerLat) return null;

  // Calculate bounds to fit all markers
  const allPoints = [
    ...(centerLat && centerLng ? [{ lat: centerLat, lng: centerLng }] : []),
    ...stops.map((s) => ({ lat: s.lat, lng: s.lng })),
  ];

  if (allPoints.length === 0) return null;

  // Default center: hunt center or first stop
  const defaultCenter = centerLat && centerLng
    ? { lat: centerLat, lng: centerLng }
    : { lat: allPoints[0].lat, lng: allPoints[0].lng };

  function handleLoad(map: google.maps.Map) {
    mapRef.current = map;

    if (allPoints.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      allPoints.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 40);
    }
  }

  if (!isLoaded) {
    return (
      <div className="rounded-lg bg-gray-100 mb-4" style={MAP_STYLES}>
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
      <GoogleMap
        mapContainerStyle={MAP_STYLES}
        center={defaultCenter}
        zoom={14}
        onLoad={handleLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Hunt center marker (blue) */}
        {centerLat && centerLng && (
          <Marker
            position={{ lat: centerLat, lng: centerLng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#2563eb",
              fillOpacity: 0.8,
              strokeColor: "#1e40af",
              strokeWeight: 2,
            }}
            title="Hunt center"
            onClick={() => setSelectedStop(null)}
          />
        )}

        {/* Stop markers (orange/red numbered) */}
        {stops.map((stop) => (
          <Marker
            key={stop.order}
            position={{ lat: stop.lat, lng: stop.lng }}
            label={{
              text: String(stop.order),
              color: "white",
              fontSize: "11px",
              fontWeight: "bold",
            }}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
              fillColor: "#ea580c",
              fillOpacity: 0.9,
              strokeColor: "#c2410c",
              strokeWeight: 1,
              scale: 1.5,
              anchor: new google.maps.Point(12, 24),
              labelOrigin: new google.maps.Point(12, 9),
            }}
            onClick={() => setSelectedStop(stop)}
          />
        ))}

        {/* Info window for selected stop */}
        {selectedStop && (
          <InfoWindow
            position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
            onCloseClick={() => setSelectedStop(null)}
          >
            <div className="text-xs">
              <p className="font-medium">Stop {selectedStop.order}</p>
              <p className="text-gray-600">{selectedStop.name}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          Hunt center
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
          Stops ({stops.length})
        </span>
      </div>
    </div>
  );
}
