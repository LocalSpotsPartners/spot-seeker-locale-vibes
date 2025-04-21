
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
        const placesWithCoordinates = filteredPlaces.filter(p => p.coordinates);
        if (placesWithCoordinates.length > 0) {
          const sumLat = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[1] || 0), 0);
          const sumLng = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[0] || 0), 0);
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
    filteredPlaces,
    hoveredPlace,
    onMarkerClick: (clickedPlace) => {
      console.log('Marker clicked for place:', clickedPlace.name);
      setPopupInfo(null);
      setHighlightedPlace(clickedPlace);
    }
  });

  const { handleUserLocation } = useUserLocation(map, mapInitialized);

  // Handle viewport changes
  if (map && mapInitialized) {
    map.on('moveend', () => {
      if (onViewportChange) {
        const bounds = map.getBounds();
        onViewportChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    });
  }

  // Handle popup
  if (map && mapInitialized && popupInfo && popupInfo.coordinates) {
    const popup = createMapPopup(popupInfo, map);
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
    <div className="h-full w-full bg-gray-100 relative" style={{ minHeight: '500px' }}>
      <MapControls 
        onLocationClick={handleUserLocation}
        placesCount={filteredPlaces.filter(p => p.coordinates).length}
      />
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '500px' }} />
      {highlightedPlace && (
        <div className="absolute top-4 left-4 z-10">
          <HighlightedPlace place={highlightedPlace} />
        </div>
      )}
    </div>
  );
}
