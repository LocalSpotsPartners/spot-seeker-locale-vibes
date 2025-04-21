
import { useState, useRef } from 'react';
import { Place, PlaceFeature } from '@/types';
import { useMapbox } from '@/hooks/useMapbox';
import { useGeocoding } from '@/hooks/useGeocoding';
import { MapLoading } from './MapLoading';
import { MapError } from './MapError';
import { HighlightedPlace } from './HighlightedPlace';
import { MapControls } from './MapControls';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useUserLocation } from '@/hooks/useUserLocation';
import { createMapPopup } from './MapPopup';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
  hoveredPlace?: Place | null;
  onViewportChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

export function MapView({ places, selectedFeatures, hoveredPlace, onViewportChange }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Place | null>(null);
  const [highlightedPlace, setHighlightedPlace] = useState<Place | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoadingToken, error: mapboxError } = useMapbox();
  const { geocodedPlaces } = useGeocoding(places);

  const filteredPlaces = places.filter((place) => 
    selectedFeatures.length === 0 || 
    selectedFeatures.every(feature => place.features.includes(feature))
  );

  const { map, mapInitialized } = useMapInitialization({
    mapContainer,
    mapboxToken,
    onMapLoad: () => {
      if (map && filteredPlaces.length > 0) {
        const placesWithCoordinates = filteredPlaces.filter(p => 
          p.location && p.location.lat !== 0 && p.location.lng !== 0
        );
        
        if (placesWithCoordinates.length > 0) {
          const sumLat = placesWithCoordinates.reduce((sum, place) => sum + place.location.lat, 0);
          const sumLng = placesWithCoordinates.reduce((sum, place) => sum + place.location.lng, 0);
          const centerLat = sumLat / placesWithCoordinates.length;
          const centerLng = sumLng / placesWithCoordinates.length;
          map.setCenter([centerLng, centerLat]);
        }
      }
    }
  });

  const markersRef = useMapMarkers({
    map,
    mapInitialized,
    filteredPlaces: filteredPlaces.map(place => ({
      ...place, 
      coordinates: place.location ? [place.location.lng, place.location.lat] as [number, number] : undefined
    })),
    hoveredPlace,
    onMarkerClick: (clickedPlace) => {
      console.log('Marker clicked for place:', clickedPlace.name);
      setPopupInfo(null);
      setHighlightedPlace(clickedPlace);
    }
  });

  const { handleUserLocation } = useUserLocation(map, mapInitialized);

  // Still notify about viewport changes but don't use them for filtering
  if (map && mapInitialized && onViewportChange) {
    map.on('moveend', () => {
      const bounds = map.getBounds();
      onViewportChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    });
  }

  // Handle popup
  if (map && mapInitialized && popupInfo && popupInfo.location) {
    const popupCoordinates: [number, number] = [popupInfo.location.lng, popupInfo.location.lat];
    const popup = createMapPopup({...popupInfo, coordinates: popupCoordinates}, map);
    if (popup) {
      popup.on('close', () => setPopupInfo(null));
    }
  }

  if (isLoadingToken) {
    return <MapLoading />;
  }

  if (mapboxError || !mapboxToken) {
    return <MapError places={places} />;
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-lg border border-gray-200" style={{ minHeight: '500px' }}>
      <MapControls 
        onLocationClick={handleUserLocation}
        placesCount={filteredPlaces.filter(p => p.location && p.location.lat !== 0 && p.location.lng !== 0).length}
      />
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }}/>
      {highlightedPlace && (
        <div className="absolute top-4 left-4 z-10">
          <HighlightedPlace place={highlightedPlace} />
        </div>
      )}
    </div>
  );
}
