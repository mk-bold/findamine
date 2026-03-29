"use client";

import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from "@react-google-maps/api";
import { useCallback, useState } from "react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const containerStyle = { width: "100%", height: "250px", borderRadius: "8px" };

// Default: BYU campus
const DEFAULT_CENTER = { lat: 40.2338, lng: -111.6585 };

const libraries: ("places")[] = ["places"];

export default function LocationPicker({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
}: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [searchInput, setSearchInput] = useState("");
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const position = latitude && longitude
    ? { lat: latitude, lng: longitude }
    : null;

  const center = position || DEFAULT_CENTER;

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onLocationChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onLocationChange]
  );

  const handleSearch = useCallback(() => {
    if (!map || !searchInput.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        onLocationChange(loc.lat(), loc.lng());
        map.panTo(loc);
        map.setZoom(17);
      }
    });
  }, [map, searchInput, onLocationChange]);

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Address search */}
      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search address or place..."
          aria-label="Search for an address or place"
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
        >
          Search
        </button>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={position ? 17 : 14}
        onLoad={onLoad}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {position && (
          <>
            <MarkerF position={position} />
            <CircleF
              center={position}
              radius={radiusMeters}
              options={{
                fillColor: "#0EA5E9",
                fillOpacity: 0.1,
                strokeColor: "#0EA5E9",
                strokeWeight: 2,
                strokeOpacity: 0.5,
              }}
            />
          </>
        )}
      </GoogleMap>

      <p className="text-[10px] text-gray-500">
        Click the map to set the location, or search for an address above.
      </p>
    </div>
  );
}
