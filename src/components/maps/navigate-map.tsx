"use client";

import { GoogleMap, useJsApiLoader, CircleF, MarkerF } from "@react-google-maps/api";
import { useCallback, useState } from "react";

interface NavigateMapProps {
  /** Target location center */
  targetLat: number;
  targetLng: number;
  /** Arrival radius in meters */
  radiusMeters: number;
  /** Current user position (null = waiting for GPS) */
  userLat: number | null;
  userLng: number | null;
  /** Hot/cold zone for coloring */
  zone: string | null;
}

const ZONE_COLORS: Record<string, string> = {
  icy: "#3B82F6",
  cold: "#60A5FA",
  warm: "#F59E0B",
  hot: "#F97316",
  burning: "#EF4444",
};

const containerStyle = { width: "100%", height: "280px", borderRadius: "12px" };

export default function NavigateMap({
  targetLat,
  targetLng,
  radiusMeters,
  userLat,
  userLng,
  zone,
}: NavigateMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  // Center on user if available, otherwise target
  const center = userLat && userLng
    ? { lat: userLat, lng: userLng }
    : { lat: targetLat, lng: targetLng };

  const zoneColor = zone ? ZONE_COLORS[zone] || "#6B7280" : "#6B7280";

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      onLoad={onLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          // Subtle map style — reduce visual noise
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      }}
    >
      {/* Target area circle */}
      <CircleF
        center={{ lat: targetLat, lng: targetLng }}
        radius={radiusMeters}
        options={{
          fillColor: "#10B981",
          fillOpacity: 0.15,
          strokeColor: "#10B981",
          strokeWeight: 2,
          strokeOpacity: 0.5,
        }}
      />

      {/* User position marker */}
      {userLat && userLng && (
        <MarkerF
          position={{ lat: userLat, lng: userLng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: zoneColor,
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}
