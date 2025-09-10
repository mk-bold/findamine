'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, DollarSign, BookOpen, Globe, Target, Camera, X, Upload, Search, HelpCircle, Locate } from 'lucide-react';
import toast from 'react-hot-toast';
import GameCluesList from './GameCluesList';

// Google Maps tl yypes
declare global {
  interface Window {
    google: any;
  }
}

interface Game {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  isOngoing: boolean;
  maxPlayers: number;
  gameCenterLat: number;
  gameCenterLng: number;
  gameCenterAddress: string;
  prizePool: number;
  entryFee: number;
  rules: string;
  isPublic: boolean;
  gameCode?: string;
  // New game fields
  clueReleaseSchedule: 'ALL_AT_ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  baseCluePoints: number;
  timeDiscountType: 'NONE' | 'LINEAR' | 'CURVE_LINEAR';
  timeDiscountRate: number;
  prizeType: ('OVERALL_GAME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'NONE')[];
  prizeDistribution: 'TOP_PLAYERS' | 'RANDOM_LOTTERY';
  prizeDelivery: 'IN_PERSON' | 'ELECTRONIC';
  // Admin-only fields
  profileCompletionPoints: number;
  referralPoints: number;
  followerPoints: number;
  privacyBonusPoints: any;
  pointTrackingMode: 'HISTORICAL' | 'REAL_TIME';
  createdAt: string;
  updatedAt: string;
  gamePhotos?: Array<{
    id: string;
    filename: string;
    originalName: string;
    description?: string;
    isGameCenter: boolean;
    isFavorited: boolean;
    order: number;
  }>;
}

interface GameFormProps {
  game?: Game | null;
  onSubmit: (data: Partial<Game> & { photos?: File[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function GameForm({ game, onSubmit, onCancel, isLoading }: GameFormProps) {
  const [formData, setFormData] = useState<Partial<Game>>({
    name: '',
    description: '',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    isOngoing: false,
    maxPlayers: 10,
    gameCenterLat: 0,
    gameCenterLng: 0,
    gameCenterAddress: '',
    prizePool: 0,
    entryFee: 0,
    rules: '',
    isPublic: true,
    gameCode: '',
    // New game fields with defaults
    clueReleaseSchedule: 'ALL_AT_ONCE',
    baseCluePoints: 100,
    timeDiscountType: 'LINEAR',
    timeDiscountRate: 5,
    prizeType: ['OVERALL_GAME'],
    prizeDistribution: 'TOP_PLAYERS',
    prizeDelivery: 'ELECTRONIC',
    // Admin-only fields with defaults
    profileCompletionPoints: 50,
    referralPoints: 25,
    followerPoints: 10,
    privacyBonusPoints: {"PRIVATE":0, "MINIONS_ONLY":10, "MINIONS_AND_FRENEMIES":25, "PUBLIC":50},
    pointTrackingMode: 'REAL_TIME',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoDescriptions, setPhotoDescriptions] = useState<string[]>(['', '', '']);
  const [existingPhotos, setExistingPhotos] = useState<Array<{id: string, url: string, description: string, order: number}>>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverType, setDragOverType] = useState<'existing' | 'new' | null>(null);

  // Map-related state
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [helpTooltip, setHelpTooltip] = useState<string | null>(null);
  const [isValidatingGameCode, setIsValidatingGameCode] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    if (game) {
      const newFormData = {
        name: game.name || '',
        description: game.description || '',
        status: game.status || 'DRAFT',
        startDate: game.startDate ? game.startDate.split('T')[0] : '',
        endDate: game.endDate ? game.endDate.split('T')[0] : '',
        isOngoing: game.isOngoing || false,
        maxPlayers: game.maxPlayers || 10,
        gameCenterLat: game.gameCenterLat || 0,
        gameCenterLng: game.gameCenterLng || 0,
        gameCenterAddress: game.gameCenterAddress || '',
        prizePool: game.prizePool || 0,
        entryFee: game.entryFee || 0,
        rules: game.rules || '',
        isPublic: game.isPublic ?? true,
        gameCode: game.gameCode || '',
        // New game fields
        clueReleaseSchedule: game.clueReleaseSchedule || 'ALL_AT_ONCE',
        baseCluePoints: game.baseCluePoints || 100,
        timeDiscountType: game.timeDiscountType || 'LINEAR',
        timeDiscountRate: game.timeDiscountRate || 5,
        prizeType: Array.isArray(game.prizeType) ? game.prizeType : [game.prizeType || 'OVERALL_GAME'],
        prizeDistribution: game.prizeDistribution || 'TOP_PLAYERS',
        prizeDelivery: game.prizeDelivery || 'ELECTRONIC',
        // Admin-only fields
        profileCompletionPoints: game.profileCompletionPoints || 50,
        referralPoints: game.referralPoints || 25,
        followerPoints: game.followerPoints || 10,
        privacyBonusPoints: game.privacyBonusPoints || {"PRIVATE":0, "MINIONS_ONLY":10, "MINIONS_AND_FRENEMIES":25, "PUBLIC":50},
        pointTrackingMode: game.pointTrackingMode || 'REAL_TIME',
      };
      console.log('Setting form data from game:', newFormData);
      console.log('Game photos data:', game.gamePhotos);
      console.log('Game photos type:', typeof game.gamePhotos);
      console.log('Game photos length:', game.gamePhotos?.length);
      if (game.gamePhotos && game.gamePhotos.length > 0) {
        console.log('First game photo:', game.gamePhotos[0]);
      }
      setFormData(newFormData);
      
      // Load existing photos if available
      if (game.gamePhotos && game.gamePhotos.length > 0) {
        console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        console.log('Using API URL:', apiUrl);
        
        const photosWithOrder = game.gamePhotos.map((photo: any) => ({
          id: photo.id,
          url: `${apiUrl}/uploads/game-photos/${photo.filename}`,
          description: photo.description || '',
          order: photo.order || 0
        }));
        setExistingPhotos(photosWithOrder);
        console.log('Loaded existing photos:', photosWithOrder);
        console.log('Photo URLs:', photosWithOrder.map(p => p.url));
      } else {
        setExistingPhotos([]);
      }
    } else {
      // Ensure form has proper default values even when creating new game
      setFormData(prev => {
        const newFormData = {
          name: prev.name || '',
          description: prev.description || '',
          status: prev.status || 'DRAFT',
          startDate: prev.startDate || '',
          endDate: prev.endDate || '',
          isOngoing: prev.isOngoing || false,
          maxPlayers: prev.maxPlayers || 10,
          gameCenterLat: prev.gameCenterLat || 0,
          gameCenterLng: prev.gameCenterLng || 0,
          gameCenterAddress: prev.gameCenterAddress || '',
          prizePool: prev.prizePool || 0,
          entryFee: prev.entryFee || 0,
          rules: prev.rules || '',
          isPublic: prev.isPublic ?? true,
          gameCode: prev.gameCode || '',
          // New game fields with defaults
          clueReleaseSchedule: prev.clueReleaseSchedule || 'ALL_AT_ONCE',
          baseCluePoints: prev.baseCluePoints || 100,
          timeDiscountType: prev.timeDiscountType || 'LINEAR',
          timeDiscountRate: prev.timeDiscountRate || 5,
          prizeType: Array.isArray(prev.prizeType) ? prev.prizeType : [prev.prizeType || 'OVERALL_GAME'],
          prizeDistribution: prev.prizeDistribution || 'TOP_PLAYERS',
          prizeDelivery: prev.prizeDelivery || 'ELECTRONIC',
          // Admin-only fields with defaults
          profileCompletionPoints: prev.profileCompletionPoints || 50,
          referralPoints: prev.referralPoints || 25,
          followerPoints: prev.followerPoints || 10,
          privacyBonusPoints: prev.privacyBonusPoints || {"PRIVATE":0, "MINIONS_ONLY":10, "MINIONS_AND_FRENEMIES":25, "PUBLIC":50},
          pointTrackingMode: prev.pointTrackingMode || 'REAL_TIME',
        };
        console.log('Setting form data defaults:', newFormData);
        return newFormData;
      });
      setExistingPhotos([]);
    }
  }, [game]);

  // Initialize map when component mounts or when game data changes
  useEffect(() => {
    if (mapRef.current) {
      // Small delay to ensure form data is populated
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formData.gameCenterLat, formData.gameCenterLng]);

  // Debug existing photos state
  useEffect(() => {
    console.log('Existing photos state changed:', existingPhotos);
    console.log('Existing photos length:', existingPhotos.length);
    if (existingPhotos.length > 0) {
      console.log('First photo URL:', existingPhotos[0].url);
      console.log('First photo object:', existingPhotos[0]);
    }
  }, [existingPhotos]);

  const initializeMap = () => {
    // Load Google Maps API
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
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

  const detectUserLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      return null;
    }

    return new Promise((resolve) => {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('User location detected:', userLocation);
          setIsDetectingLocation(false);
          resolve(userLocation);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          setIsDetectingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const createMap = async () => {
    if (!mapRef.current) {
      console.error('Map container not found');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.error('Google Maps API not fully loaded');
      return;
    }

    let defaultCenter;
    
    // If editing existing game, use existing coordinates
    if (formData.gameCenterLat && formData.gameCenterLng) {
      defaultCenter = { lat: formData.gameCenterLat, lng: formData.gameCenterLng };
    } 
    // If creating new game, try to detect user location
    else if (!game) {
      const userLocation = await detectUserLocation();
      if (userLocation) {
        defaultCenter = userLocation;
        // Update form data with detected location
        getAddressFromCoordinates(userLocation.lat, userLocation.lng);
      } else {
        // Fall back to NYC if geolocation fails
        defaultCenter = { lat: 40.7128, lng: -74.0060 };
      }
    }
    // Default fallback
    else {
      defaultCenter = { lat: 40.7128, lng: -74.0060 };
    }

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);

      // Add click listener to map
      mapInstance.addListener('click', (event: any) => {
        const lat = event.latLng?.lat() || 0;
        const lng = event.latLng?.lng() || 0;
        
        updateMarkerPosition(event.latLng);
        getAddressFromCoordinates(lat, lng);
      });

          // If we have initial coordinates, place a marker
    if (formData.gameCenterLat && formData.gameCenterLng && formData.gameCenterLat !== 0 && formData.gameCenterLng !== 0) {
      const initialPosition = new window.google.maps.LatLng(formData.gameCenterLat, formData.gameCenterLng);
      
      // Use AdvancedMarkerElement if available, fallback to deprecated Marker
      let initialMarker;
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        initialMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: initialPosition,
          map: mapInstance,
          title: 'Game Center Location',
        });
      } else {
        initialMarker = new window.google.maps.Marker({
          position: initialPosition,
          map: mapInstance,
          draggable: true,
          title: 'Game Center Location',
        });
      }
      
      // Add drag listener to marker
      initialMarker.addListener('dragend', (event: any) => {
        const lat = event.latLng?.lat() || 0;
        const lng = event.latLng?.lng() || 0;
        getAddressFromCoordinates(lat, lng);
      });
      
      setMarker(initialMarker);
      
      // Get address for initial location
      getAddressFromCoordinates(formData.gameCenterLat, formData.gameCenterLng);
    }

      setIsMapLoading(false);
    } catch (error) {
      console.error('Error creating map:', error);
      setIsMapLoading(false);
    }
  };

  const updateMarkerPosition = (position: any) => {
    if (marker) {
      marker.setPosition(position);
    } else if (map) {
      let newMarker;
      
      // Use AdvancedMarkerElement if available, fallback to deprecated Marker
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: map,
          title: 'Game Center Location',
        });
      } else {
        newMarker = new window.google.maps.Marker({
          position: position,
          map: map,
          draggable: true,
          title: 'Game Center Location',
        });
      }
      
      // Add drag listener to new marker
      newMarker.addListener('dragend', (event: any) => {
        const lat = event.latLng?.lat() || 0;
        const lng = event.latLng?.lng() || 0;
        getAddressFromCoordinates(lat, lng);
      });
      
      setMarker(newMarker);
    }
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setFormData(prev => ({
          ...prev,
          gameCenterLat: lat,
          gameCenterLng: lng,
          gameCenterAddress: address,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          gameCenterLat: lat,
          gameCenterLng: lng,
          gameCenterAddress: 'Unknown location',
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setFormData(prev => ({
        ...prev,
        gameCenterLat: lat,
        gameCenterLng: lng,
        gameCenterAddress: 'Unknown location',
      }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map) return;

    setIsSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ address: searchQuery });
      
      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Center map on search result
        map.setCenter(location);
        map.setZoom(15);
        
        // Update marker
        updateMarkerPosition(location);
        
        // Get address and update form
        const address = response.results[0].formatted_address;
        setFormData(prev => ({
          ...prev,
          gameCenterLat: lat,
          gameCenterLng: lng,
          gameCenterAddress: address,
        }));
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleManualLocationDetection = async () => {
    if (!map) return;
    
    const userLocation = await detectUserLocation();
    if (userLocation) {
      // Center map on detected location
      map.setCenter(userLocation);
      map.setZoom(15);
      
      // Update marker
      const newPosition = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
      updateMarkerPosition(newPosition);
      
      // Get address and update form
      getAddressFromCoordinates(userLocation.lat, userLocation.lng);
      
      toast.success('Location detected successfully!');
    } else {
      toast.error('Unable to detect location. Please allow location access or search manually.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log('Checkbox changed:', name, checked);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: checked,
      };
      console.log('New form data after checkbox change:', newData);
      return newData;
    });
  };

  const handlePrizeTypeChange = (value: string, checked: boolean) => {
    setFormData(prev => {
      let newPrizeTypes = Array.isArray(prev.prizeType) ? [...prev.prizeType] : [];
      
      if (value === 'NONE') {
        // If "None" is selected, clear all other selections
        newPrizeTypes = checked ? ['NONE'] : [];
      } else {
        if (checked) {
          // Remove "None" if it exists and add the new value
          newPrizeTypes = newPrizeTypes.filter(type => type !== 'NONE');
          if (!newPrizeTypes.includes(value as any)) {
            newPrizeTypes.push(value as any);
          }
        } else {
          // Remove the value
          newPrizeTypes = newPrizeTypes.filter(type => type !== value);
        }
      }
      
      return {
        ...prev,
        prizeType: newPrizeTypes,
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + existingPhotos.length + files.length > 3) {
      alert('You can only upload up to 3 photos total');
      return;
    }
    
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    
    // Initialize descriptions for new photos
    const newDescriptions = [...photoDescriptions];
    for (let i = photos.length; i < newPhotos.length; i++) {
      newDescriptions[i] = '';
    }
    setPhotoDescriptions(newDescriptions);

    // Save new photos immediately to the database
    await saveNewPhotosImmediately(files);
  };

  const saveNewPhotosImmediately = async (newFiles: File[]) => {
    if (!game?.id) {
      toast.error('Cannot save photos: Game not found');
      return;
    }

    try {
      const formData = new FormData();
      newFiles.forEach((file, index) => {
        formData.append('photo', file);
        formData.append('description', photoDescriptions[photos.length + index] || '');
      });

      const response = await fetch(`/api/games/upload-photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Photos uploaded successfully');
        
        // Refresh the game data to get the new photos
        // This will trigger a re-render with the updated photos
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number, type: 'existing' | 'new') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setDragOverType(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number, type: 'existing' | 'new') => {
    e.preventDefault();
    setDragOverIndex(index);
    setDragOverType(type);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, targetType: 'existing' | 'new') => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { index: sourceIndex, type: sourceType } = data;

    if (sourceType === targetType && sourceIndex === targetIndex) return;

    if (sourceType === 'existing' && targetType === 'existing') {
      // Reorder existing photos
      const newExistingPhotos = [...existingPhotos];
      const [movedPhoto] = newExistingPhotos.splice(sourceIndex, 1);
      newExistingPhotos.splice(targetIndex, 0, movedPhoto);
      
      // Update order numbers
      newExistingPhotos.forEach((photo, idx) => {
        photo.order = idx;
      });
      
      setExistingPhotos(newExistingPhotos);
      
      // Save the new order to the database
      savePhotoOrder(newExistingPhotos);
    } else if (sourceType === 'new' && targetType === 'new') {
      // Reorder new photos
      const newPhotos = [...photos];
      const [movedPhoto] = newPhotos.splice(sourceIndex, 1);
      newPhotos.splice(targetIndex, 0, movedPhoto);
      setPhotos(newPhotos);
      
      // Reorder descriptions accordingly
      const newDescriptions = [...photoDescriptions];
      const [movedDescription] = newDescriptions.splice(sourceIndex, 1);
      newDescriptions.splice(targetIndex, 0, movedDescription);
      setPhotoDescriptions(newDescriptions);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newDescriptions = photoDescriptions.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoDescriptions(newDescriptions);
  };

  const removeExistingPhoto = async (index: number) => {
    const photo = existingPhotos[index];
    if (!photo || !photo.id) {
      console.error('Cannot delete photo: missing photo ID');
      return;
    }

    try {
      // Call the backend API to delete the photo
      const response = await fetch(`/api/photos/game/${photo.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove from local state after successful deletion
        const newExistingPhotos = existingPhotos.filter((_, i) => i !== index);
        setExistingPhotos(newExistingPhotos);
        toast.success('Photo deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const savePhotoOrder = async (photos: Array<{id: string, url: string, description: string, order: number}>) => {
    try {
      // Update photo descriptions and order in the database
      const updatePromises = photos.map(async (photo, index) => {
        const response = await fetch(`/api/photos/game/${photo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            description: photo.description,
            order: index,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update photo ${photo.id}`);
        }
      });

      await Promise.all(updatePromises);
      toast.success('Photo order updated successfully');
    } catch (error) {
      console.error('Error updating photo order:', error);
      toast.error('Failed to update photo order');
    }
  };

  const updatePhotoDescription = async (index: number, description: string) => {
    const newDescriptions = [...photoDescriptions];
    newDescriptions[index] = description;
    setPhotoDescriptions(newDescriptions);

    // Save description change immediately for existing photos
    if (existingPhotos[index]) {
      const photo = existingPhotos[index];
      try {
        const response = await fetch(`/api/photos/game/${photo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            description: description,
            order: photo.order,
          }),
        });

        if (!response.ok) {
          toast.error('Failed to save photo description');
        }
      } catch (error) {
        console.error('Error saving photo description:', error);
        toast.error('Failed to save photo description');
      }
    }
  };

  const validateGameCode = async (gameCode: string): Promise<boolean> => {
    if (!gameCode.trim()) return true; // Empty game code is valid (will be auto-generated)
    
    setIsValidatingGameCode(true);
    try {
      const response = await fetch(`/api/games/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameCode: gameCode.trim(),
          excludeGameId: game?.id, // Exclude current game when editing
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isAvailable;
      } else {
        console.error('Failed to validate game code');
        return false;
      }
    } catch (error) {
      console.error('Error validating game code:', error);
      return false;
    } finally {
      setIsValidatingGameCode(false);
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Game name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Game description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.gameCenterLat === 0 && formData.gameCenterLng === 0) {
      newErrors.gameCenter = 'Game center location is required';
    }

    // Validate game code for private games
    if (!formData.isPublic && formData.gameCode && formData.gameCode.trim()) {
      const isGameCodeAvailable = await validateGameCode(formData.gameCode);
      if (!isGameCodeAvailable) {
        newErrors.gameCode = 'This game code is already taken. Please choose a different code.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    // Send game data along with photos for the parent component to handle
    // Note: existingPhotos is only used for display/reordering in the frontend
    const submitData = {
      ...formData,
      photos: photos.length > 0 ? photos : undefined,
      photoDescriptions: photoDescriptions,
      // existingPhotos is filtered out by the parent component before sending to backend
    };

    onSubmit(submitData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'PAUSED': return 'text-yellow-600';
      case 'COMPLETED': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {game ? 'Edit Game' : 'Create New Game'}
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Game Name *
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'gameName' ? null : 'gameName')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'gameName' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Give it a descriptive and attractive name to help people find your game in search results
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter game name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status || 'DRAFT'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setHelpTooltip(helpTooltip === 'gameDescription' ? null : 'gameDescription')}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {helpTooltip === 'gameDescription' && (
                <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  Describe the purpose and audience for your game. Make it sound exciting and interesting to attract more players who will search for public, open games in their area.
                </div>
              )}
            </div>
          </div>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your game..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Game Center Location - Unified Map Interface */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Game Center Location
            </h3>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for a location or address..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleManualLocationDetection}
              disabled={isDetectingLocation}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              title="Use my current location"
            >
              <Locate className="w-4 h-4 mr-1" />
              {isDetectingLocation ? 'Detecting...' : 'Use My Location'}
            </button>
          </div>

          {/* Interactive Map */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-80 rounded-lg border border-gray-300"
            />
            
            {/* Map Instructions */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-700">
                <MapPin className="h-4 w-4 inline mr-1" />
                Click on the map to select a location or drag the marker
              </p>
            </div>

            {/* Loading State */}
            {(isMapLoading || isDetectingLocation) && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {isDetectingLocation ? 'Detecting your location...' : 'Loading map...'}
                  </p>
                  {isDetectingLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please allow location access for automatic centering
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          {formData.gameCenterLat && formData.gameCenterLng ? (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Coordinates:</p>
                  <p className="font-mono text-sm">
                    {formData.gameCenterLat.toFixed(6)}, {formData.gameCenterLng.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="text-sm">{formData.gameCenterAddress || 'Address not available'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center py-4 text-gray-500">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p>No location set. Click on the map or search for a location to set the game center.</p>
            </div>
          )}
          {errors.gameCenter && <p className="text-red-500 text-sm mt-1">{errors.gameCenter}</p>}
        </div>

        {/* Admin-Only Settings */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="w-5 h-5 mr-2 text-red-500">🔒</span>
            Admin Settings
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These settings are only visible and editable to administrators.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Completion Points
              </label>
              <input
                type="number"
                name="profileCompletionPoints"
                value={formData.profileCompletionPoints || 50}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Points
              </label>
              <input
                type="number"
                name="referralPoints"
                value={formData.referralPoints || 25}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follower Points
              </label>
              <input
                type="number"
                name="followerPoints"
                value={formData.followerPoints || 10}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Point Tracking Mode
              </label>
              <select
                name="pointTrackingMode"
                value={formData.pointTrackingMode || 'REAL_TIME'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HISTORICAL">Historical</option>
                <option value="REAL_TIME">Real Time</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Bonus Points (JSON)
            </label>
            <textarea
              name="privacyBonusPoints"
              value={JSON.stringify(formData.privacyBonusPoints || {"PRIVATE":0, "MINIONS_ONLY":10, "MINIONS_AND_FRENEMIES":25, "PUBLIC":50}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, privacyBonusPoints: parsed }));
                } catch (error) {
                  // Invalid JSON, keep the text as is for user to fix
                  setFormData(prev => ({ ...prev, privacyBonusPoints: e.target.value }));
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"PRIVATE":0, "MINIONS_ONLY":10, "MINIONS_AND_FRENEMIES":25, "PUBLIC":50}'
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON object defining points for different privacy levels
            </p>
          </div>
        </div>

        {/* Game Clues Section */}
        {game?.id && (
          <GameCluesList 
            gameId={game.id} 
            gameCenterLat={formData.gameCenterLat} 
            gameCenterLng={formData.gameCenterLng}
            gameStartDate={formData.startDate}
          />
        )}

        {/* Photo Upload Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-blue-500" />
            Game Photos (Optional - Up to 3)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop photos to reorder them. The order determines how they will be displayed to players.
          </p>
          
          <div className="space-y-4">
            {/* Photo Upload Input - Only show if less than 3 photos */}
            {existingPhotos.length < 3 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <label className="cursor-pointer">
                  <span className="text-blue-500 hover:text-blue-600 font-medium">
                    Click to upload photos
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            ) : (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-amber-800 text-sm">
                  📸 Maximum of 3 photos reached. To add a new photo, please delete an existing one first.
                </p>
              </div>
            )}

            {/* Display Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Photos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {existingPhotos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className={`relative border rounded-lg p-3 cursor-move transition-all duration-200 ${
                        dragOverIndex === index && dragOverType === 'existing' 
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                          : 'border-gray-200'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index, 'existing')}
                      onDragOver={(e) => handleDragOver(e, index, 'existing')}
                      onDrop={(e) => handleDrop(e, index, 'existing')}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <img
                          src={photo.url}
                          alt={`Existing Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Photo description (optional)"
                        value={photo.description}
                        onChange={async (e) => {
                          const newDescription = e.target.value;
                          const newExistingPhotos = [...existingPhotos];
                          newExistingPhotos[index].description = newDescription;
                          setExistingPhotos(newExistingPhotos);
                          
                          // Save description change immediately
                          try {
                            const response = await fetch(`/api/photos/game/${photo.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                description: newDescription,
                                order: photo.order,
                              }),
                            });

                            if (!response.ok) {
                              toast.error('Failed to save photo description');
                            }
                          } catch (error) {
                            console.error('Error saving photo description:', error);
                            toast.error('Failed to save photo description');
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center justify-center mt-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Order: {photo.order + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display New Photos */}
            {photos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">New Photos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div 
                      key={`new-${index}`} 
                      className={`relative border rounded-lg p-3 cursor-move transition-all duration-200 ${
                        dragOverIndex === index && dragOverType === 'new' 
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                          : 'border-gray-200'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index, 'new')}
                      onDragOver={(e) => handleDragOver(e, index, 'new')}
                      onDrop={(e) => handleDrop(e, index, 'new')}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`New Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Photo description (optional)"
                        value={photoDescriptions[index] || ''}
                        onChange={(e) => updatePhotoDescription(index, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates and Players */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>

          <div>
            {!formData.isOngoing && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="isOngoing"
                checked={formData.isOngoing || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Ongoing Game (No End Date)
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Players
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'maxPlayers' ? null : 'maxPlayers')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'maxPlayers' && (
                  <div className="absolute z-50 top-6 left-0 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    The maximum number of players who can join your game. Choose "unlimited" to allow anyone to join without restrictions.
                  </div>
                )}
              </div>
            </div>
            <select
              name="maxPlayers"
              value={formData.maxPlayers || 10}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1</option>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>1000</option>
              <option value={10000000}>Unlimited</option>
            </select>
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prize Pool ($)
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'prizePool' ? null : 'prizePool')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'prizePool' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    The total monetary value of all prizes available for this game. Set to 0 if there are no monetary prizes.
                  </div>
                )}
              </div>
            </div>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool || 0}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Entry Fee ($)
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'entryFee' ? null : 'entryFee')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'entryFee' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    The amount each player must pay to join the game. Set to 0 for free games. Entry fees often contribute to the prize pool.
                  </div>
                )}
              </div>
            </div>
            <input
              type="number"
              name="entryFee"
              value={formData.entryFee || 0}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Clue Release Schedule
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'clueReleaseSchedule' ? null : 'clueReleaseSchedule')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'clueReleaseSchedule' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Indicates whether the clues will be released all at once at the beginning of the game or on an interval basis.
                  </div>
                )}
              </div>
            </div>
            <select
              name="clueReleaseSchedule"
              value={formData.clueReleaseSchedule || 'ALL_AT_ONCE'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL_AT_ONCE">All at Once</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Base Clue Points
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'baseCluePoints' ? null : 'baseCluePoints')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'baseCluePoints' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    This is the number of points a player gets for finding the clue immediately with no time discount or bonuses
                  </div>
                )}
              </div>
            </div>
            <input
              type="number"
              name="baseCluePoints"
              value={formData.baseCluePoints || 100}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Discount Type
            </label>
            <select
              name="timeDiscountType"
              value={formData.timeDiscountType || 'LINEAR'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="LINEAR">Linear</option>
              <option value="CURVE_LINEAR">Curve Linear</option>
            </select>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Discount Rate
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'timeDiscountRate' ? null : 'timeDiscountRate')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'timeDiscountRate' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    This is the number of points per hour that will be subtracted from the base clue points as time passes. For example, if set to 5, a clue worth 100 points will be worth 95 points after 1 hour, 90 points after 2 hours, etc.
                  </div>
                )}
              </div>
            </div>
            <input
              type="number"
              name="timeDiscountRate"
              value={formData.timeDiscountRate || 5}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Prize Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prize Type
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'prizeType' ? null : 'prizeType')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'prizeType' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Choose when prizes are awarded: Overall Game (at the end), Daily (every day), Weekly (every week), Monthly (every month), Yearly (every year), or None (no prizes). You can select multiple options.
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-none"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('NONE')}
                  onChange={(e) => handlePrizeTypeChange('NONE', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-none" className="ml-2 text-sm text-gray-700">
                  None
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-overall"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('OVERALL_GAME')}
                  onChange={(e) => handlePrizeTypeChange('OVERALL_GAME', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-overall" className="ml-2 text-sm text-gray-700">
                  Overall Game
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-daily"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('DAILY')}
                  onChange={(e) => handlePrizeTypeChange('DAILY', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-daily" className="ml-2 text-sm text-gray-700">
                  Daily
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-weekly"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('WEEKLY')}
                  onChange={(e) => handlePrizeTypeChange('WEEKLY', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-weekly" className="ml-2 text-sm text-gray-700">
                  Weekly
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-monthly"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('MONTHLY')}
                  onChange={(e) => handlePrizeTypeChange('MONTHLY', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-monthly" className="ml-2 text-sm text-gray-700">
                  Monthly
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prizeType-yearly"
                  checked={Array.isArray(formData.prizeType) && formData.prizeType.includes('YEARLY')}
                  onChange={(e) => handlePrizeTypeChange('YEARLY', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="prizeType-yearly" className="ml-2 text-sm text-gray-700">
                  Yearly
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prize Distribution
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'prizeDistribution' ? null : 'prizeDistribution')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'prizeDistribution' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Choose how prizes are distributed: Top Players (highest scores win) or Random Lottery (winners selected randomly from eligible players based on a weighted random point-based distribution)
                  </div>
                )}
              </div>
            </div>
            <select
              name="prizeDistribution"
              value={formData.prizeDistribution || 'TOP_PLAYERS'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOP_PLAYERS">Top Players</option>
              <option value="RANDOM_LOTTERY">Random Lottery</option>
            </select>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prize Delivery
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'prizeDelivery' ? null : 'prizeDelivery')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'prizeDelivery' && (
                  <div className="absolute z-50 top-6 left-0 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Choose how prizes will be delivered: In Person (physical meetup required) or Electronic (digital delivery like gift cards or transfers)
                  </div>
                )}
              </div>
            </div>
            <select
              name="prizeDelivery"
              value={formData.prizeDelivery || 'ELECTRONIC'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="IN_PERSON">In Person</option>
              <option value="ELECTRONIC">Electronic</option>
            </select>
          </div>
        </div>

        {/* Rules */}
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Game Rules
            </label>
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setHelpTooltip(helpTooltip === 'gameRules' ? null : 'gameRules')}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {helpTooltip === 'gameRules' && (
                <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  Enter the any rules and instructions for your game. This will be shown to players before they join. Include any special requirements, restrictions, or gameplay mechanics. Also, clearly detail out the prizes and necessity of any entry fees. Be very open and clear about how prizes are awarded and delivered so there are no conflicts or misunderstandings.
                </div>
              )}
            </div>
          </div>
          <textarea
            name="rules"
            value={formData.rules || ''}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter game rules and instructions..."
          />
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic ?? true}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Make this game public
          </label>
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setHelpTooltip(helpTooltip === 'isPublic' ? null : 'isPublic')}
              className="text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {helpTooltip === 'isPublic' && (
              <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                Public games appear in the game list and anyone can join. Private games require a game code to join and won't be listed publicly.
              </div>
            )}
          </div>
        </div>
        


        {/* Private Game Code */}
        {!formData.isPublic && (
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Private Game Code
              </label>
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setHelpTooltip(helpTooltip === 'privateGameCode' ? null : 'privateGameCode')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpTooltip === 'privateGameCode' && (
                  <div className="absolute z-50 top-6 left-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    A unique code that players must enter to join your private game. Choose something memorable but not easily guessable. Leave blank to auto-generate.
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                name="gameCode"
                value={formData.gameCode || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gameCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter a unique code for private access"
                disabled={isValidatingGameCode}
              />
              {isValidatingGameCode && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {errors.gameCode && <p className="text-red-500 text-sm mt-1">{errors.gameCode}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Players will need this code to join your private game
            </p>
          </div>
        )}

        {/* Informational Message for New Games */}
        {!game && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-blue-400">ℹ️</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Next Steps:</strong> After creating your game, you can add clues by editing the game details. 
                  Clues are the locations and challenges that players will discover during your game.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                {game ? 'Update Game' : 'Create Game'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
