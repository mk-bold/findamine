'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Plus, Edit, Eye, Trash2, Save, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { utcToLocalDateTimeString, localToUtcDateTimeString, getCurrentLocalDateTimeString } from '../lib/timezone';

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface ClueLocation {
  id: string;
  identifyingName: string;
  anonymizedName: string;
  latitude: number;
  longitude: number;
  text: string;
  hint?: string;
  gpsVerificationRadius: number;
  requiresSelfie: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GameClue {
  id: string;
  gameId: string;
  clueLocationId: string;
  clueLocation: ClueLocation;
  customText?: string;
  customHint?: string;
  points: number;
  releaseTime?: string;
  isReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClueSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameCenterLat?: number;
  gameCenterLng?: number;
  gameStartDate?: string;
  onClueAdded: () => void;
  editingClue?: GameClue | null;
}

export default function ClueSearchModal({ 
  isOpen, 
  onClose, 
  gameId, 
  gameCenterLat, 
  gameCenterLng,
  gameStartDate,
  onClueAdded,
  editingClue
}: ClueSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [existingClues, setExistingClues] = useState<ClueLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClue, setSelectedClue] = useState<ClueLocation | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newMarker, setNewMarker] = useState<any>(null);
  
  // New state for enhanced search functionality
  const [searchRadius, setSearchRadius] = useState('2'); // Default to 2km
  const [customRadius, setCustomRadius] = useState('');
  const [googleSearchResults, setGoogleSearchResults] = useState<any[]>([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showAnonymousHelp, setShowAnonymousHelp] = useState(false);
  
  // Form state for new clue creation
  const [formData, setFormData] = useState({
    identifyingName: '',
    anonymizedName: '',
    latitude: 0,
    longitude: 0,
    address: '',
    text: '',
    hint: '',
    gpsVerificationRadius: 6, // 20 feet in meters
    requiresSelfie: true,
    points: 100,
    releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
  });
  
  // Map-related state
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [radiusCircle, setRadiusCircle] = useState<any>(null);
  const [allBlueMarkers, setAllBlueMarkers] = useState<any[]>([]);
  
  // AI-related state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [clueStyle, setClueStyle] = useState<'easy' | 'medium' | 'hard' | 'cryptic' | 'riddle' | 'historical' | 'fun'>('medium');
  const [gameTheme, setGameTheme] = useState('');
  const [showAiAlternatives, setShowAiAlternatives] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<{
    clueTexts: string[];
    hints: string[];
  }>({ clueTexts: [], hints: [] });

  useEffect(() => {
    if (isOpen && mapRef.current) {
      initializeMap();
    }
  }, [isOpen, gameCenterLat, gameCenterLng]);

  useEffect(() => {
    if (isOpen && (gameCenterLat && gameCenterLng)) {
      if (editingClue) {
        // For edit mode, only get clues currently attached to this game
        searchGameClues();
      } else {
        // For new clue mode, get all clues in 5-mile radius
        searchExistingClues();
      }
    }
  }, [isOpen, gameCenterLat, gameCenterLng, editingClue]);

  useEffect(() => {
    if (map && existingClues.length > 0) {
      updateMapMarkers(existingClues);
    }
  }, [map, existingClues]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Update radius circle when searchRadius changes
  useEffect(() => {
    if (map && gameCenterLat && gameCenterLng) {
      updateRadiusCircle(searchRadius);
    }
  }, [searchRadius, map, gameCenterLat, gameCenterLng]);

  // Cleanup blue markers when modal closes
  useEffect(() => {
    return () => {
      // Cleanup all blue markers when component unmounts
      allBlueMarkers.forEach((marker) => {
        try {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        } catch (error) {
          console.warn('Error cleaning up blue marker:', error);
        }
      });
    };
  }, [allBlueMarkers]);

  useEffect(() => {
    if (editingClue) {
      setFormData({
        identifyingName: editingClue.clueLocation.identifyingName,
        anonymizedName: editingClue.clueLocation.anonymizedName,
        latitude: editingClue.clueLocation.latitude,
        longitude: editingClue.clueLocation.longitude,
        address: '', // We'll need to reverse geocode this
        text: editingClue.customText || editingClue.clueLocation.text,
        hint: editingClue.customHint || editingClue.clueLocation.hint || '',
        gpsVerificationRadius: editingClue.clueLocation.gpsVerificationRadius,
        requiresSelfie: editingClue.clueLocation.requiresSelfie,
        points: editingClue.points,
        releaseTime: utcToLocalDateTimeString(editingClue.releaseTime) || utcToLocalDateTimeString(gameStartDate) || ''
      });
      setSelectedClue(editingClue.clueLocation);
      setIsCreatingNew(false);
    } else {
      // Reset form when not editing
      setFormData({
        identifyingName: '',
        anonymizedName: '',
        latitude: 0,
        longitude: 0,
        address: '',
        text: '',
        hint: '',
        gpsVerificationRadius: 6,
        requiresSelfie: true,
        points: 100,
        releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
      });
      setSelectedClue(null);
      setIsCreatingNew(false);
    }
  }, [editingClue, gameStartDate]);

  const initializeMap = () => {
    if (window.google && window.google.maps && window.google.maps.Map) {
      createMap();
    } else {
      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script is loading, wait for it
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkGoogle);
            createMap();
          }
        }, 100);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait a bit more for the API to fully initialize
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            createMap();
          }
        }, 500);
      };
      document.head.appendChild(script);
    }
  };

  const createMap = () => {
    if (!mapRef.current) return;

    const center = gameCenterLat && gameCenterLng 
      ? { lat: gameCenterLat, lng: gameCenterLng }
      : { lat: 40.7128, lng: -74.0060 }; // Default to NYC

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: center,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    });

    setMap(mapInstance);

    // Add game center marker
    if (gameCenterLat && gameCenterLng) {
      try {
        // Create red marker element for game center
        const redPin = document.createElement('div');
        redPin.className = 'red-marker';
        redPin.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: #FF0000;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: gameCenterLat, lng: gameCenterLng },
            map: mapInstance,
            title: 'Game Center',
            content: redPin
          });
        } else {
          // Fallback to deprecated Marker for compatibility
          new window.google.maps.Marker({
            position: { lat: gameCenterLat, lng: gameCenterLng },
            map: mapInstance,
            title: 'Game Center',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
          });
        }
      } catch (error) {
        console.warn('Error creating game center marker:', error);
        // Final fallback
        new window.google.maps.Marker({
          position: { lat: gameCenterLat, lng: gameCenterLng },
          map: mapInstance,
          title: 'Game Center',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });
      }

      // Add dynamic radius circle based on searchRadius
      const radiusInKm = parseFloat(searchRadius);
      const isGlobal = searchRadius === '12742'; // Global option
      
      if (!isGlobal && !isNaN(radiusInKm) && radiusInKm > 0) {
        const circle = new window.google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.1,
          map: mapInstance,
          center: { lat: gameCenterLat, lng: gameCenterLng },
          radius: radiusInKm * 1000, // Convert km to meters
          clickable: false, // This is key - prevents circle from blocking clicks
        });
        
        // Store circle reference for dynamic updates
        setRadiusCircle(circle);
        
        console.log(`🔴 Radius circle created: ${radiusInKm} km`);
      } else {
        console.log('🌍 Global radius selected - no circle created');
      }
    }

    // Add click listener for creating new clues
    mapInstance.addListener('click', (event: any) => {
      console.log('🗺️ Map click event triggered!', event);
      console.log('Event target:', event.target);
      console.log('Event pixel:', event.pixel);
      
      if (!event || !event.latLng) {
        console.error('Invalid click event:', event);
        return;
      }
      
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      console.log('Map clicked at:', lat, lng);
      console.log('Game center:', gameCenterLat, gameCenterLng);
      
      // Calculate distance from game center
      if (gameCenterLat && gameCenterLng) {
        const distanceFromCenter = calculateDistance(gameCenterLat, gameCenterLng, lat, lng);
        console.log('Distance from game center:', distanceFromCenter, 'miles');
      }
      
      console.log('Current existingClues length:', existingClues.length);
      
      // Check if clicked very close to an existing marker (more precise tolerance)
      const clickedOnExisting = existingClues.some(clue => {
        const latDiff = Math.abs(clue.latitude - lat);
        const lngDiff = Math.abs(clue.longitude - lng);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        console.log(`Distance to clue ${clue.identifyingName}:`, distance);
        // Use much smaller tolerance - only ignore if VERY close to existing marker
        return distance < 0.0001; // About 10 meters
      });
      
      console.log('Clicked on existing marker:', clickedOnExisting);
      
      if (!clickedOnExisting) {
        console.log('🎯 Calling handleMapClick');
        handleMapClick(lat, lng, mapInstance);
      } else {
        console.log('⚠️ Click ignored - too close to existing marker');
        // Show which existing clue is too close
        const closestClue = existingClues.find(clue => {
          const latDiff = Math.abs(clue.latitude - lat);
          const lngDiff = Math.abs(clue.longitude - lng);
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          return distance < 0.0001;
        });
        if (closestClue) {
          toast.info(`Too close to existing clue: ${closestClue.identifyingName}`);
        }
      }
    });
  };

  const handleMapClick = async (lat: number, lng: number, mapInstance?: any) => {
    console.log('handleMapClick called with:', lat, lng);
    console.log('Current map state:', map);
    console.log('Passed mapInstance:', mapInstance);
    
    const currentMap = mapInstance || map;
    
    if (!currentMap) {
      console.error('Map not available');
      toast.error('Map not ready. Please wait and try again.');
      return;
    }
    
    // Remove ALL previous blue markers (only one blue marker at a time)
    console.log('Removing all previous blue markers. Count:', allBlueMarkers.length);
    allBlueMarkers.forEach((marker, index) => {
      try {
        if (marker && marker.setMap) {
          marker.setMap(null);
          console.log(`✅ Removed blue marker ${index + 1}`);
        }
      } catch (error) {
        console.warn(`Error removing blue marker ${index + 1}:`, error);
      }
    });
    
    // Clear the arrays
    setAllBlueMarkers([]);
    setNewMarker(null);

    // Create new marker (blue color)
    let marker;
    try {
      console.log('Creating new marker...');
      
      // Always try the simple Marker approach first for better compatibility
      marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: currentMap,
        title: 'New Clue Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        },
        draggable: false,
        animation: window.google.maps.Animation.DROP
      });

      console.log('Standard Marker created successfully');
    } catch (error) {
      console.error('Error creating standard marker:', error);
      
      // If that fails, try a really basic approach
      try {
        marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: currentMap,
          title: 'New Clue Location'
        });
        console.log('Basic Marker created as fallback');
      } catch (fallbackError) {
        console.error('All marker creation methods failed:', fallbackError);
        toast.error('Unable to place marker. Please try again.');
        return;
      }
    }

    console.log('✅ Blue marker created successfully:', marker);
    setNewMarker(marker);
    
    // Add to blue markers tracking array
    setAllBlueMarkers([marker]);
    
    // Double check that marker is visible on map
    if (marker && marker.getMap()) {
      console.log('✅ Marker is attached to map');
    } else {
      console.error('❌ Marker not properly attached to map');
      // Try to force attach it
      try {
        marker.setMap(currentMap);
        console.log('🔧 Forced marker attachment to map');
      } catch (error) {
        console.error('❌ Failed to force attach marker:', error);
      }
    }
    
    // Pan to the marker location to make it visible
    if (currentMap) {
      currentMap.panTo({ lat, lng });
      console.log('🗺️ Panned map to marker location');
    }

    // Reverse geocode and also try to get Google Places data
    console.log('Starting reverse geocoding and Places lookup...');
    
    // First do reverse geocoding to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results: any, status: any) => {
      console.log('Geocoding result:', status, results);
      
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        const components = results[0].address_components;
        console.log('Address components:', components);
        
        // Check if it's a residence
        const isResidence = components.some((c: any) => 
          c.types.includes('subpremise') || 
          c.types.includes('premise') ||
          (c.types.includes('street_number') && !components.some((comp: any) => 
            comp.types.includes('establishment') || comp.types.includes('point_of_interest')
          ))
        );
        
        let locationName = 'Unidentified location';
        let placesData = null;
        
        // Try to get Google Places data using multiple methods
        if (window.google.maps.places) {
          try {
            const placesService = new window.google.maps.places.PlacesService(currentMap);
            
            // Method 1: Use findPlaceFromQuery for more accurate results
            const queryRequest = {
              query: `${lat},${lng}`,
              fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
              locationBias: new window.google.maps.Circle({
                center: { lat: lat, lng: lng },
                radius: 20
              })
            };
            
            placesData = await new Promise((resolve) => {
              placesService.findPlaceFromQuery(queryRequest, (results: any, status: any) => {
                console.log('🎯 findPlaceFromQuery result:', status, results);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                  const place = results[0];
                  console.log('✅ Found place via query:', place.name || 'No name');
                  resolve(place);
                } else {
                  console.log('❌ Query search failed, trying nearbySearch...');
                  
                  // Method 2: Fallback to nearbySearch with very small radius
                  const nearbyRequest = {
                    location: new window.google.maps.LatLng(lat, lng),
                    radius: 15, // Very small radius - 15 meters
                  };
                  
                  placesService.nearbySearch(nearbyRequest, (nearbyResults: any, nearbyStatus: any) => {
                    console.log('🔍 Nearby search result:', nearbyStatus, nearbyResults);
                    if (nearbyStatus === window.google.maps.places.PlacesServiceStatus.OK && nearbyResults && nearbyResults.length > 0) {
                      // Find the closest result to our click point
                      let closest = nearbyResults[0];
                      let minDistance = Infinity;
                      
                      nearbyResults.forEach((result: any) => {
                        if (result.geometry?.location) {
                          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                            new window.google.maps.LatLng(lat, lng),
                            result.geometry.location
                          );
                          if (distance < minDistance) {
                            minDistance = distance;
                            closest = result;
                          }
                        }
                      });
                      
                      console.log('✅ Found closest nearby place:', closest.name || 'No name', `(${minDistance.toFixed(0)}m away)`);
                      resolve(closest);
                    } else {
                      console.log('❌ No places found nearby');
                      resolve(null);
                    }
                  });
                }
              });
            });
          } catch (error) {
            console.warn('Places API error:', error);
            placesData = null;
          }
        }
        
        // Determine location name based on Places data - prioritize Google Places name
        let anonymizedName = 'Unidentified location';
        
        if (placesData && (placesData as any).name) {
          locationName = (placesData as any).name;
          console.log('✅ Using Google Places name:', locationName);
          
          // Create a more generic anonymous name based on place types
          const types = (placesData as any).types || [];
          if (types.length > 0) {
            if (types.includes('restaurant') || types.includes('food')) {
              anonymizedName = 'Local Restaurant';
            } else if (types.includes('gas_station')) {
              anonymizedName = 'Gas Station';
            } else if (types.includes('bank') || types.includes('atm')) {
              anonymizedName = 'Financial Institution';
            } else if (types.includes('store') || types.includes('shopping_mall')) {
              anonymizedName = 'Retail Location';
            } else if (types.includes('hospital') || types.includes('pharmacy')) {
              anonymizedName = 'Medical Facility';
            } else if (types.includes('school') || types.includes('university')) {
              anonymizedName = 'Educational Institution';
            } else if (types.includes('church') || types.includes('place_of_worship')) {
              anonymizedName = 'Place of Worship';
            } else if (types.includes('park')) {
              anonymizedName = 'Park or Recreation Area';
            } else if (types.includes('gym') || types.includes('spa')) {
              anonymizedName = 'Fitness Center';
            } else if (types.includes('library')) {
              anonymizedName = 'Public Library';
            } else if (types.includes('post_office')) {
              anonymizedName = 'Postal Service';
            } else if (types.includes('establishment')) {
              anonymizedName = 'Local Business';
            } else {
              // Fallback - use the business name but make it more generic
              anonymizedName = 'Local Establishment';
            }
            console.log('🎭 Generated anonymous name based on types:', anonymizedName, 'from types:', types);
          } else {
            // No types available, use the business name
            anonymizedName = locationName;
          }
        } else {
          // If no Google Places name found, use "Unidentified location"
          locationName = 'Unidentified location';
          anonymizedName = 'Unidentified location';
          console.log('❌ No Google Places name found, using:', locationName);
        }
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: address,
          identifyingName: locationName,
          anonymizedName: anonymizedName,
          text: locationName === 'Unidentified location' 
            ? `Find this location at ${address.split(',')[0]}`
            : `Find ${locationName}`,
          hint: locationName === 'Unidentified location'
            ? `Look for this location`
            : `Look for ${locationName.toLowerCase()}`,
          points: 100,
          releaseTime: prev.releaseTime || utcToLocalDateTimeString(gameStartDate) || ''
        }));
        
        // Show a toast to indicate success
        toast.success(`📍 New clue location selected: ${locationName}`);
      } else {
        console.log('Geocoding failed, using coordinates');
        const coordsString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: coordsString,
          identifyingName: 'Unidentified location',
          anonymizedName: 'Unidentified location', // Same name for both
          text: `Find this location at ${coordsString}`,
          hint: 'Look for this location',
          points: 100,
          releaseTime: prev.releaseTime || utcToLocalDateTimeString(gameStartDate) || ''
        }));
        
        toast.success('📍 New clue location selected');
      }
    });

    console.log('Setting isCreatingNew to true');
    setIsCreatingNew(true);
    setSelectedClue(null);
  };

  const handleGoogleSearch = async (query: string) => {
    if (!query.trim() || !window.google || !window.google.maps || !map) {
      setGoogleSearchResults([]);
      return;
    }

    try {
      setIsSearchingGoogle(true);
      
      // Try modern Places API first, fallback to Geocoding API
      if (window.google.maps.places && window.google.maps.places.AutocompleteService) {
        try {
          await handleModernPlacesSearch(query);
        } catch (error) {
          console.warn('Modern Places API failed, falling back to Geocoding API:', error);
          await handleGeocodingFallback(query);
        }
      } else {
        // Fallback to Geocoding API if Places API is not available
        console.warn('Places API not available, using Geocoding API fallback');
        await handleGeocodingFallback(query);
      }
    } catch (error) {
      console.error('Error in Google search:', error);
      setGoogleSearchResults([]);
      setIsSearchingGoogle(false);
    }
  };

  const handleModernPlacesSearch = async (query: string) => {
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    const placesService = new window.google.maps.places.PlacesService(map);
    
    // Use locationRestriction instead of deprecated bounds/radius
    const locationRestriction = gameCenterLat && gameCenterLng ? {
      center: new window.google.maps.LatLng(gameCenterLat, gameCenterLng),
      radius: parseFloat(searchRadius) * 1000 // Convert km to meters
    } : undefined;

    const request = {
      input: query,
      locationRestriction: locationRestriction,
      types: ['establishment', 'geocode']
    };

    autocompleteService.getPlacePredictions(request, (predictions: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const detailPromises = predictions.slice(0, 3).map((prediction: any) => {
          return new Promise((resolve) => {
            placesService.getDetails(
              { placeId: prediction.place_id, fields: ['place_id', 'name', 'formatted_address', 'geometry'] },
              (place: any, status: any) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                  let isWithinRadius = true;
                  if (gameCenterLat && gameCenterLng && place.geometry?.location) {
                    const distance = calculateDistance(
                      gameCenterLat,
                      gameCenterLng,
                      place.geometry.location.lat(),
                      place.geometry.location.lng()
                    );
                    isWithinRadius = distance !== null && distance <= parseFloat(searchRadius) * 0.621371;
                  }
                  
                  if (isWithinRadius) {
                    resolve({
                      place_id: place.place_id,
                      name: place.name,
                      formatted_address: place.formatted_address,
                      geometry: place.geometry
                    });
                  } else {
                    resolve(null);
                  }
                } else {
                  resolve(null);
                }
              }
            );
          });
        });

        Promise.all(detailPromises).then((results: any[]) => {
          const validResults = results.filter(result => result !== null);
          setGoogleSearchResults(validResults);
          setIsSearchingGoogle(false);
        });
      } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        console.warn('Places API access denied, falling back to Geocoding API');
        throw new Error(`Places API access denied: ${status}`);
      } else {
        console.warn(`Places API returned status: ${status}, falling back to Geocoding API`);
        throw new Error(`Places API error: ${status}`);
      }
    });
  };

  const handleGeocodingFallback = async (query: string) => {
    const geocoder = new window.google.maps.Geocoder();
    
    const request = {
      address: query,
      region: 'us'
    };

    geocoder.geocode(request, (results: any, status: any) => {
      if (status === window.google.maps.GeocoderStatus.OK && results) {
        let filteredResults = results;
        if (gameCenterLat && gameCenterLng) {
          filteredResults = results.filter((result: any) => {
            const distance = calculateDistance(
              gameCenterLat, 
              gameCenterLng, 
              result.geometry.location.lat(), 
              result.geometry.location.lng()
            );
            return distance !== null && distance <= parseFloat(searchRadius) * 0.621371;
          });
        }
        
        // Convert geocoding results to match Places API format
        const formattedResults = filteredResults.slice(0, 3).map((result: any) => ({
          place_id: result.place_id,
          name: null, // Geocoding doesn't provide business names
          formatted_address: result.formatted_address,
          geometry: result.geometry
        }));
        
        setGoogleSearchResults(formattedResults);
        setIsSearchingGoogle(false);
      } else {
        setGoogleSearchResults([]);
        setIsSearchingGoogle(false);
      }
    });
  };

  const handleSearchResultClick = (result: any) => {
    if (!result.geometry?.location) return;
    
    const lat = result.geometry.location.lat();
    const lng = result.geometry.location.lng();
    
    console.log('Search result clicked:', result.name || result.formatted_address, lat, lng);
    
    // Add blue marker for the selected search result
    handleMapClick(lat, lng);
    
    // Update form with the search result data
    const placeName = result.name || result.formatted_address;
    const anonymizedName = result.name ? 
      `Clue at ${result.name}` : 
      `Search Result - ${new Date().toLocaleDateString()}`;
    
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: result.formatted_address,
      identifyingName: placeName,
      anonymizedName: anonymizedName,
      text: `Find this location: ${placeName}`,
      hint: `Look for ${placeName}`,
      gpsVerificationRadius: 6,
      requiresSelfie: true,
      points: 100,
      releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
    }));
    
    console.log('Form data updated with search result');
    
    setIsCreatingNew(true);
    setSelectedClue(null);
    
    // Clear search results
    setGoogleSearchResults([]);
    setSearchQuery('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      
      // First try to search for existing clues
      const clueParams = new URLSearchParams();
      clueParams.append('search', searchQuery);
      
      if (gameCenterLat && gameCenterLng) {
        clueParams.append('lat', gameCenterLat.toString());
        clueParams.append('lng', gameCenterLng.toString());
        clueParams.append('radius', '5'); // 5 miles
      }

      const clueResponse = await fetch(`http://localhost:4000/game-master/clue-locations?${clueParams}`, {
        credentials: 'include',
      });

      if (clueResponse.ok) {
        const clueData = await clueResponse.json();
        setExistingClues(clueData);
        
        // If we found clues, use the first one to add a blue marker
        if (clueData.length > 0) {
          const firstClue = clueData[0];
          handleMapClick(firstClue.latitude, firstClue.longitude);
          setFormData(prev => ({
            ...prev,
            identifyingName: firstClue.identifyingName,
            anonymizedName: firstClue.anonymizedName,
            latitude: firstClue.latitude,
            longitude: firstClue.longitude,
            text: firstClue.text,
            hint: firstClue.hint || '',
            gpsVerificationRadius: firstClue.gpsVerificationRadius,
            requiresSelfie: firstClue.requiresSelfie,
            points: 100,
            releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
          }));
          setSelectedClue(firstClue);
          setIsCreatingNew(false);
          return;
        }
      }
      
      // If no clues found, try to geocode the search query as an address
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            // Add blue marker for the searched address
            handleMapClick(lat, lng);
            
            // Update form with the searched address
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              address: results[0].formatted_address,
              identifyingName: results[0].formatted_address,
              anonymizedName: `Search Result - ${new Date().toLocaleDateString()}`,
              text: `Clue at ${results[0].formatted_address}`,
              hint: '',
              gpsVerificationRadius: 6,
              requiresSelfie: true,
              points: 100,
              releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
            }));
            
            setIsCreatingNew(true);
            setSelectedClue(null);
          } else {
            toast.error('Address not found. Please try a different search term.');
          }
        });
      } else {
        toast.error('No clues found and geocoding not available.');
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchGameClues = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:4000/game-master/games/${gameId}/clues`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Extract ClueLocation data from GameClue objects
        const clueLocations = data.map((gameClue: any) => gameClue.clueLocation);
        setExistingClues(clueLocations);
        updateMapMarkers(clueLocations);
      } else {
        toast.error('Failed to fetch game clues');
      }
    } catch (error) {
      console.error('Error fetching game clues:', error);
      toast.error('Failed to fetch game clues');
    } finally {
      setIsLoading(false);
    }
  };

  const searchExistingClues = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (gameCenterLat && gameCenterLng) {
        params.append('lat', gameCenterLat.toString());
        params.append('lng', gameCenterLng.toString());
        params.append('radius', '5'); // 5 miles
      }

      const response = await fetch(`http://localhost:4000/game-master/clue-locations?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setExistingClues(data);
      } else {
        toast.error('Failed to search clues');
      }
    } catch (error) {
      console.error('Error searching clues:', error);
      toast.error('Failed to search clues');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapMarkers = (clueLocations: ClueLocation[]) => {
    if (!map) return;

    // Clear existing markers (except new marker)
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    clueLocations.forEach((clue) => {
      let marker;
      
      try {
        // Create green marker element
        const greenPin = document.createElement('div');
        greenPin.className = 'green-marker';
        greenPin.style.cssText = `
          width: 18px;
          height: 18px;
          background-color: #00AA00;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: clue.latitude, lng: clue.longitude },
            map: map,
            title: `${clue.identifyingName}\n${clue.text}`,
            content: greenPin
          });
        } else {
          marker = new window.google.maps.Marker({
            position: { lat: clue.latitude, lng: clue.longitude },
            map: map,
            title: `${clue.identifyingName}\n${clue.text}`,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }
          });
        }
      } catch (error) {
        console.warn('Error creating clue marker, using fallback:', error);
        marker = new window.google.maps.Marker({
          position: { lat: clue.latitude, lng: clue.longitude },
          map: map,
          title: `${clue.identifyingName}\n${clue.text}`,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        });
      }

      // Add click listener
      marker.addListener('click', () => {
        setSelectedClue(clue);
        setIsCreatingNew(false);
        if (newMarker) {
          newMarker.setMap(null);
          setNewMarker(null);
        }
        // Pre-fill form with existing clue data
        setFormData(prev => ({
          ...prev,
          identifyingName: clue.identifyingName,
          anonymizedName: clue.anonymizedName,
          latitude: clue.latitude,
          longitude: clue.longitude,
          text: clue.text,
          hint: clue.hint || '',
          gpsVerificationRadius: clue.gpsVerificationRadius,
          requiresSelfie: clue.requiresSelfie,
          points: 100,
          releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
        }));
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const updateRadiusCircle = (radius: string) => {
    console.log('🔄 Updating radius circle to:', radius);
    
    // Remove existing circle
    if (radiusCircle) {
      radiusCircle.setMap(null);
      setRadiusCircle(null);
    }

    // Don't create circle for global, custom without value, or if no map/game center
    if (!map || !gameCenterLat || !gameCenterLng || radius === '12742' || radius === 'custom') {
      console.log('🌍 No circle needed for:', radius);
      return;
    }

    const radiusInKm = parseFloat(radius);
    if (isNaN(radiusInKm) || radiusInKm <= 0) {
      console.log('❌ Invalid radius value:', radius);
      return;
    }

    // Create new circle
    const circle = new window.google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.1,
      map: map,
      center: { lat: gameCenterLat, lng: gameCenterLng },
      radius: radiusInKm * 1000, // Convert km to meters
      clickable: false, // Prevents circle from blocking clicks
    });

    setRadiusCircle(circle);
    console.log(`✅ New radius circle created: ${radiusInKm} km`);
  };

  const handleCustomRadiusChange = (value: string) => {
    setCustomRadius(value);
    
    // Update circle if it's a valid number
    const radiusValue = parseFloat(value);
    if (!isNaN(radiusValue) && radiusValue > 0) {
      updateRadiusCircle(value);
    } else if (radiusCircle) {
      // Remove circle if invalid value
      radiusCircle.setMap(null);
      setRadiusCircle(null);
    }
  };

  const handleSelectExistingClue = (clue: ClueLocation) => {
    setSelectedClue(clue);
    setIsCreatingNew(false);
    if (newMarker) {
      newMarker.setMap(null);
      setNewMarker(null);
    }
    
    // Pre-fill form with existing clue data
    setFormData(prev => ({
      ...prev,
      identifyingName: clue.identifyingName,
      anonymizedName: clue.anonymizedName,
      latitude: clue.latitude,
      longitude: clue.longitude,
      text: clue.text,
      hint: clue.hint || '',
      gpsVerificationRadius: clue.gpsVerificationRadius,
      requiresSelfie: clue.requiresSelfie,
      points: 100,
      releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
    }));
  };

  const convertBlueMarkerToGreen = () => {
    if (newMarker && map) {
      console.log('🔄 Converting blue marker to green');
      
      // Get the position before removing the blue marker
      const position = newMarker.getPosition();
      
      // Remove the blue marker
      newMarker.setMap(null);
      setNewMarker(null);
      
      // Clear from blue markers tracking
      setAllBlueMarkers([]);
      
      // Create a new green marker at the same location
      let greenMarker;
      try {
        greenMarker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: `${formData.identifyingName}\n${formData.text}`,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        // Add click listener to the new green marker
        greenMarker.addListener('click', () => {
          // Find the corresponding clue in existingClues and select it
          const correspondingClue = existingClues.find(clue => 
            Math.abs(clue.latitude - position.lat()) < 0.00001 && 
            Math.abs(clue.longitude - position.lng()) < 0.00001
          );
          if (correspondingClue) {
            handleSelectExistingClue(correspondingClue);
          }
        });

        // Add to markers array
        setMarkers(prev => [...prev, greenMarker]);
        
        console.log('✅ Blue marker converted to green marker');
      } catch (error) {
        console.error('Error creating green marker:', error);
      }
    }
  };

  const resetFormForNewClue = () => {
    console.log('🔄 Resetting form for new clue');
    setFormData({
      identifyingName: '',
      anonymizedName: '',
      latitude: 0,
      longitude: 0,
      address: '',
      text: '',
      hint: '',
      gpsVerificationRadius: 6,
      requiresSelfie: true,
      points: 100,
      releaseTime: utcToLocalDateTimeString(gameStartDate) || ''
    });
    setSelectedClue(null);
    setIsCreatingNew(false);
    setShowAiAlternatives(false);
    setAiAlternatives({ clueTexts: [], hints: [] });
  };

  const handleSaveAndAddAnother = async () => {
    try {
      // First save the current clue
      await saveCurrentClue();
      
      // Convert blue marker to green
      convertBlueMarkerToGreen();
      
      // Refresh the existing clues list
      await refreshExistingClues();
      
      // Reset form for new clue
      resetFormForNewClue();
      
      toast.success('Clue saved! Ready to add another.');
    } catch (error) {
      console.error('Error in save and add another:', error);
      toast.error('Failed to save clue. Please try again.');
    }
  };

  const refreshExistingClues = async () => {
    console.log('🔄 Refreshing existing clues list');
    if (editingClue) {
      // For edit mode, get clues currently attached to this game
      await searchGameClues();
    } else {
      // For new clue mode, get all clues in radius
      await searchExistingClues();
    }
  };

  const saveCurrentClue = async () => {
    try {
        if (isCreatingNew) {
          // Create new clue location and add to game
          const clueLocationData = {
            identifyingName: formData.identifyingName,
            anonymizedName: formData.anonymizedName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            text: formData.text,
            hint: formData.hint || undefined,
            gpsVerificationRadius: formData.gpsVerificationRadius,
            requiresSelfie: formData.requiresSelfie,
          };

          // First create the clue location
          const locationResponse = await fetch('http://localhost:4000/game-master/clue-locations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(clueLocationData),
          });

          if (!locationResponse.ok) {
            throw new Error('Failed to create clue location');
          }

          const newClueLocation = await locationResponse.json();

          // Then add it to the game
          const gameClueData = {
            clueLocationId: newClueLocation.id,
            customText: formData.text !== newClueLocation.text ? formData.text : undefined,
            customHint: formData.hint !== newClueLocation.hint ? formData.hint : undefined,
            points: formData.points,
            releaseTime: formData.releaseTime ? localToUtcDateTimeString(formData.releaseTime) : undefined,
          };

          const gameResponse = await fetch(`http://localhost:4000/game-master/games/${gameId}/clues`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(gameClueData),
          });

          if (!gameResponse.ok) {
            throw new Error('Failed to add clue to game');
          }
        } else if (selectedClue) {
          // Add existing clue to game
          const gameClueData = {
            clueLocationId: selectedClue.id,
            customText: formData.text !== selectedClue.text ? formData.text : undefined,
            customHint: formData.hint !== selectedClue.hint ? formData.hint : undefined,
            points: formData.points,
            releaseTime: formData.releaseTime ? localToUtcDateTimeString(formData.releaseTime) : undefined,
          };

          const response = await fetch(`http://localhost:4000/game-master/games/${gameId}/clues`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(gameClueData),
          });

          if (!response.ok) {
            if (response.status === 409) {
              throw new Error('This clue location is already added to this game');
            }
            throw new Error('Failed to add clue to game');
          }
        } else if (editingClue) {
          // Update existing game clue
          const updateData = {
            customText: formData.text !== editingClue.clueLocation.text ? formData.text : undefined,
            customHint: formData.hint !== editingClue.clueLocation.hint ? formData.hint : undefined,
            points: formData.points,
            releaseTime: formData.releaseTime ? localToUtcDateTimeString(formData.releaseTime) : undefined,
          };

          const response = await fetch(`http://localhost:4000/game-master/games/${gameId}/clues/${editingClue.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updateData),
          });

          if (!response.ok) {
            throw new Error('Failed to update clue');
          }
        }

        return true; // Success
    } catch (error) {
      console.error('Error saving clue:', error);
      throw error;
    }
  };

  const handleSaveClue = async () => {
    try {
      await saveCurrentClue();
      toast.success(editingClue ? 'Clue updated successfully' : 'Clue added to game successfully');
      onClueAdded();
      onClose();
    } catch (error) {
      console.error('Error saving clue:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save clue');
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateAiClue = async () => {
    if (!formData.identifyingName || !formData.address || !formData.latitude || !formData.longitude) {
      toast.error('Please select a location first before generating AI content');
      return;
    }

    try {
      setIsGeneratingAi(true);
      const response = await fetch('http://localhost:4000/ai/generate-clue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          locationName: formData.identifyingName,
          locationAddress: formData.address,
          locationLat: formData.latitude,
          locationLng: formData.longitude,
          clueStyle: clueStyle,
          gameTheme: gameTheme || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI clue');
      }

      const aiResponse = await response.json();
      
      // Update form with AI-generated content
      setFormData(prev => ({
        ...prev,
        text: aiResponse.clueText,
        hint: aiResponse.hint
      }));

      // Store alternatives for user to choose from
      setAiAlternatives({
        clueTexts: [aiResponse.clueText, ...aiResponse.alternativeTexts],
        hints: [aiResponse.hint, ...aiResponse.alternativeHints]
      });

      setShowAiAlternatives(true);
      toast.success('AI clue generated successfully!');
    } catch (error) {
      console.error('Error generating AI clue:', error);
      toast.error('Failed to generate AI clue. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const improveAiClue = async () => {
    if (!formData.text || !formData.identifyingName) {
      toast.error('Please enter some clue text to improve');
      return;
    }

    try {
      setIsGeneratingAi(true);
      const response = await fetch('http://localhost:4000/ai/improve-clue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          locationName: formData.identifyingName,
          locationAddress: formData.address,
          locationLat: formData.latitude,
          locationLng: formData.longitude,
          clueStyle: clueStyle,
          gameTheme: gameTheme || undefined,
          existingClueText: formData.text
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve clue with AI');
      }

      const aiResponse = await response.json();
      
      // Update form with improved content
      setFormData(prev => ({
        ...prev,
        text: aiResponse.clueText,
        hint: aiResponse.hint
      }));

      // Store alternatives
      setAiAlternatives({
        clueTexts: [aiResponse.clueText, ...aiResponse.alternativeTexts],
        hints: [aiResponse.hint, ...aiResponse.alternativeHints]
      });

      setShowAiAlternatives(true);
      toast.success('Clue improved with AI!');
    } catch (error) {
      console.error('Error improving clue:', error);
      toast.error('Failed to improve clue. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingClue ? 'Edit Game Clue' : 'Add New Clue to Game'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for addresses or locations..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  
                  // Clear previous timeout
                  if (searchTimeout) {
                    clearTimeout(searchTimeout);
                  }
                  
                  // Set new timeout for debounced search
                  if (value.trim() && value.length >= 3) { // Only search after 3 characters
                    const timeout = setTimeout(() => {
                      handleGoogleSearch(value);
                    }, 500); // 500ms delay
                    setSearchTimeout(timeout);
                  } else {
                    setGoogleSearchResults([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGoogleSearch(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleGoogleSearch(searchQuery)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Radius:</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="0.5">0.5 km</option>
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="100">100 km</option>
                <option value="1000">1000 km</option>
                <option value="12742">Global</option>
                <option value="custom">Custom</option>
              </select>
              {searchRadius === 'custom' && (
                <input
                  type="number"
                  placeholder="km"
                  min="0.1"
                  max="20000"
                  step="0.1"
                  value={customRadius}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => handleCustomRadiusChange(e.target.value)}
                  onBlur={() => {
                    // Validate and update circle when focus leaves the field
                    const radiusValue = parseFloat(customRadius);
                    if (!isNaN(radiusValue) && radiusValue > 0) {
                      console.log('✅ Custom radius validated on blur:', radiusValue);
                      updateRadiusCircle(customRadius);
                    }
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Google Search Results */}
          {isSearchingGoogle && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Searching...</span>
              </div>
            </div>
          )}
          
          {googleSearchResults.length > 0 && !isSearchingGoogle && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Top 3 Search Results:
                {!window.google?.maps?.places && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">
                    (Using address search - Places API not enabled)
                  </span>
                )}
              </h4>
              <div className="space-y-2">
                {googleSearchResults.slice(0, 3).map((result, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {result.name || result.formatted_address}
                    </div>
                    {result.name && result.formatted_address && (
                      <div className="text-sm text-gray-600">{result.formatted_address}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {result.geometry?.location && (
                        `${result.geometry.location.lat().toFixed(6)}, ${result.geometry.location.lng().toFixed(6)}`
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map - Full Width */}
        <div className="mb-4">
          <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-medium text-gray-800 mb-1">Map Guide:</p>
                <p>• <span className="text-red-600">Red marker:</span> Game center</p>
                {searchRadius !== '12742' && searchRadius !== 'custom' && (
                  <p>• <span className="text-red-400">Red circle:</span> {searchRadius} km search radius</p>
                )}
                {searchRadius === 'custom' && customRadius && (
                  <p>• <span className="text-red-400">Red circle:</span> {customRadius} km search radius</p>
                )}
                {searchRadius === '12742' && (
                  <p>• <span className="text-gray-500">Global search:</span> No radius limit</p>
                )}
                <p>• <span className="text-green-600">Green markers:</span> Existing clues</p>
                <p>• <span className="text-blue-600">Blue marker:</span> New clue location (click map to place)</p>
                <p className="font-medium text-blue-800 mt-1">💡 Click anywhere on the map to add a new blue marker and create a clue!</p>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={() => {
                    if (gameCenterLat && gameCenterLng) {
                      console.log('🧪 Testing marker creation near game center');
                      handleMapClick(gameCenterLat + 0.001, gameCenterLng + 0.001);
                    }
                  }}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  title="Debug: Test marker creation"
                >
                  Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Clue List and Form Side by Side */}
        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Left Panel - Existing Clues List */}
          <div className="w-1/2 flex flex-col">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {editingClue ? 'Game Clues' : 'Existing Clues (5-mile radius)'}
            </h4>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching clues...</p>
                </div>
              ) : existingClues.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No existing clues found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click on the map to create a new clue location.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {existingClues.map((clue) => {
                    const distance = gameCenterLat && gameCenterLng 
                      ? calculateDistance(gameCenterLat, gameCenterLng, clue.latitude, clue.longitude)
                      : null;

                    return (
                      <div
                        key={clue.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedClue?.id === clue.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectExistingClue(clue)}
                      >
                        <h4 className="font-medium text-gray-900 text-sm">{clue.identifyingName}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{clue.text}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2">
                          <span>{clue.latitude.toFixed(4)}, {clue.longitude.toFixed(4)}</span>
                          {distance && (
                            <span className="font-medium">{distance.toFixed(1)} mi</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectExistingClue(clue);
                          }}
                          className="mt-2 w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          {editingClue ? 'Edit' : 'Add/Edit'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-1/2 flex flex-col">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {isCreatingNew ? 'Create New Clue' : selectedClue ? 'Edit Clue Details' : 'Clue Details'}
            </h4>

            {/* AI Settings Panel */}
            {(isCreatingNew || selectedClue) && (
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <h5 className="text-xs font-medium text-purple-800 mb-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generation Settings
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Clue Style
                    </label>
                    <select
                      value={clueStyle}
                      onChange={(e) => setClueStyle(e.target.value as any)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="easy">Easy - Straightforward</option>
                      <option value="medium">Medium - Moderate challenge</option>
                      <option value="hard">Hard - Challenging</option>
                      <option value="cryptic">Cryptic - Puzzle-like</option>
                      <option value="riddle">Riddle - Metaphorical</option>
                      <option value="historical">Historical - Fact-based</option>
                      <option value="fun">Fun - Playful & humorous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Game Theme (opt)
                    </label>
                    <input
                      type="text"
                      value={gameTheme}
                      onChange={(e) => setGameTheme(e.target.value)}
                      placeholder="e.g., pirates, mystery, adventure"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Clue Name (not seen by players) *
                </label>
                <input
                  type="text"
                  value={formData.identifyingName}
                  onChange={(e) => setFormData(prev => ({ ...prev, identifyingName: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., George Washington Statue"
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Anonymous Name (seen by players) *
                  </label>
                  <div className="relative ml-1">
                    <button
                      type="button"
                      onClick={() => setShowAnonymousHelp(!showAnonymousHelp)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="What is Anonymous Name?"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                    {showAnonymousHelp && (
                      <div className="absolute z-[200] right-0 top-6 w-56 p-3 bg-white border border-gray-300 rounded-lg shadow-2xl text-xs">
                        <div className="font-medium text-gray-800 mb-2">Anonymous Name Purpose:</div>
                        <div className="text-gray-600 space-y-1">
                          <p>• <strong>Players see this name</strong> - it should be less obvious than the Clue Name</p>
                          <p>• <strong>Game managers see the Clue Name</strong> - more specific for easy identification</p>
                          <p>• <strong>Example:</strong> Clue Name: "Scarr's Pizza" → Anonymous Name: "Local Restaurant"</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAnonymousHelp(false)}
                          className="mt-2 w-full text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        >
                          Got it!
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.anonymizedName}
                  onChange={(e) => setFormData(prev => ({ ...prev, anonymizedName: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Local Coffee Shop, Historic Building, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
              </div>

              {/* Enhanced Address Display - New Section */}
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h6 className="text-xs font-medium text-blue-800 mb-2 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Selected Location Details
                  </h6>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">
                      <strong>Address:</strong> {formData.address || 'Address not available'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                    {isCreatingNew && (
                      <div className="text-xs text-green-700 font-medium">
                        ✓ New clue location selected - ready for AI generation
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Clue Text *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    rows={3}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe what players need to find..."
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={generateAiClue}
                      disabled={isGeneratingAi || !formData.identifyingName || (formData.latitude === 0 && formData.longitude === 0)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        !formData.identifyingName 
                          ? "Please select a location first" 
                          : formData.latitude === 0 && formData.longitude === 0
                          ? "Click on the map to place a marker first"
                          : "Generate clue text and hints using AI for the selected location"
                      }
                    >
                      {isGeneratingAi ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Generate with AI
                    </button>
                    <button
                      type="button"
                      onClick={improveAiClue}
                      disabled={isGeneratingAi || !formData.text || (formData.latitude === 0 && formData.longitude === 0)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        !formData.text 
                          ? "Enter some clue text to improve" 
                          : formData.latitude === 0 && formData.longitude === 0
                          ? "Click on the map to place a marker first"
                          : "Improve existing clue text and hints using AI"
                      }
                    >
                      {isGeneratingAi ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      Improve with AI
                    </button>
                  </div>
                  {(formData.latitude === 0 && formData.longitude === 0) && (
                    <div className="text-xs text-amber-600 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Click on the map to place a blue marker before using AI generation
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hint
                </label>
                <textarea
                  value={formData.hint}
                  onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional hint for players..."
                />
              </div>

              {/* AI Alternatives Section */}
              {showAiAlternatives && (aiAlternatives.clueTexts.length > 0 || aiAlternatives.hints.length > 0) && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="text-xs font-medium text-blue-800 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated Alternatives
                    </h6>
                    <button
                      type="button"
                      onClick={() => setShowAiAlternatives(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {aiAlternatives.clueTexts.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Clue Text Options:</p>
                      <div className="space-y-1">
                        {aiAlternatives.clueTexts.map((text, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, text }))}
                            className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiAlternatives.hints.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Hint Options:</p>
                      <div className="space-y-1">
                        {aiAlternatives.hints.map((hint, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hint }))}
                            className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GPS Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={formData.gpsVerificationRadius}
                    onChange={(e) => setFormData(prev => ({ ...prev, gpsVerificationRadius: parseFloat(e.target.value) || 6 }))}
                    min="1"
                    max="100"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
                    min="0"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Release Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.releaseTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseTime: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresSelfie"
                  checked={formData.requiresSelfie}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresSelfie: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresSelfie" className="ml-2 text-xs text-gray-700">
                  Requires selfie verification
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                
                {/* Save and Add Another button - only show for new clues */}
                {(isCreatingNew || selectedClue) && !editingClue && (
                  <button
                    type="button"
                    onClick={handleSaveAndAddAnother}
                    disabled={!formData.identifyingName || !formData.anonymizedName || !formData.text}
                    className="px-3 py-2 text-sm border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Save this clue and continue adding more"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Save & Add Another
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleSaveClue}
                  disabled={!formData.identifyingName || !formData.anonymizedName || !formData.text || (!isCreatingNew && !selectedClue && !editingClue)}
                  className="px-3 py-2 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {editingClue ? 'Update' : 'Add'} Clue
                </button>
              </div>
              
              {/* Save New Clue button - only show in edit mode and only enabled when there's a blue marker */}
              {editingClue && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Set to creating new mode so the save logic works
                      setIsCreatingNew(true);
                      setSelectedClue(null);
                      
                      // Save the new clue from the blue marker
                      await saveCurrentClue();
                      
                      // Convert blue marker to green
                      convertBlueMarkerToGreen();
                      
                      // Refresh the existing clues list
                      await refreshExistingClues();
                      
                      // Reset form for potential next clue
                      resetFormForNewClue();
                      
                      toast.success('New clue saved! You can add another.');
                    } catch (error) {
                      console.error('Error saving new clue:', error);
                      toast.error('Failed to save new clue. Please try again.');
                    }
                  }}
                  disabled={!newMarker || !formData.identifyingName || !formData.anonymizedName || !formData.text}
                  className="px-3 py-2 text-sm border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title={!newMarker ? "Click on the map to place a blue marker first" : (!formData.identifyingName || !formData.text) ? "Please fill in required fields" : "Save the new clue from the blue marker"}
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save New Clue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}