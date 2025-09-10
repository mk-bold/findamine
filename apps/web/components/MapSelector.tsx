'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface MapSelectorProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  onCancel: () => void;
  initialLat: number;
  initialLng: number;
}

export default function MapSelector({ onSelect, onCancel, initialLat, initialLng }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const defaultCenter = initialLat && initialLng 
      ? { lat: initialLat, lng: initialLng }
      : { lat: 40.7128, lng: -74.0060 }; // Default to NYC

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(mapInstance);

    // Add click listener to map
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat() || 0;
      const lng = event.latLng?.lng() || 0;
      
      // Update marker position
      if (marker) {
        marker.setPosition(event.latLng!);
      } else {
        const newMarker = new google.maps.Marker({
          position: event.latLng!,
          map: mapInstance,
          draggable: true,
          title: 'Selected Location',
        });
        setMarker(newMarker);
      }

      // Get address for the selected location
      getAddressFromCoordinates(lat, lng);
    });

    // If we have initial coordinates, place a marker
    if (initialLat && initialLng) {
      const initialPosition = new google.maps.LatLng(initialLat, initialLng);
      const initialMarker = new google.maps.Marker({
        position: initialPosition,
        map: mapInstance,
        draggable: true,
        title: 'Selected Location',
      });
      setMarker(initialMarker);
      
      // Get address for initial location
      getAddressFromCoordinates(initialLat, initialLng);
    }
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSelectedLocation({ lat, lng, address });
      } else {
        setSelectedLocation({ lat, lng, address: 'Unknown location' });
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedLocation({ lat, lng, address: 'Unknown location' });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map) return;

    setIsSearching(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: searchQuery });
      
      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Center map on search result
        map.setCenter(location);
        map.setZoom(15);
        
        // Update marker
        if (marker) {
          marker.setPosition(location);
        } else {
          const newMarker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true,
            title: 'Selected Location',
          });
          setMarker(newMarker);
        }
        
        // Get address
        const address = response.results[0].formatted_address;
        setSelectedLocation({ lat, lng, address });
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for a location or address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
        />
        
        {/* Map Instructions */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-md shadow-sm">
          <p className="text-sm text-gray-700">
            <MapPin className="h-4 w-4 inline mr-1" />
            Click on the map to select a location
          </p>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Selected Location</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
            <p><strong>Address:</strong> {selectedLocation.address}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
      </div>

      {/* Fallback for when Google Maps API is not available */}
      {!map && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Loading map...</p>
          <p className="text-sm text-gray-500">
            If the map doesn't load, please check your internet connection and refresh the page.
          </p>
        </div>
      )}
    </div>
  );
}
