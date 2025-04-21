
import { useState, useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Place, PlaceFeature } from '@/types';
import { Button } from '@/components/ui/button';
import { useMapbox } from '@/hooks/useMapbox';
import { useGeocoding } from '@/hooks/useGeocoding';
import { MapLoading } from './MapLoading';
import { MapError } from './MapError';
import { createMapMarker } from './MapMarker';
import { createMapPopup } from './MapPopup';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
}

export function MapView({ places, selectedFeatures }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Place | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoadingToken } = useMapbox();
  const { geocodedPlaces } = useGeocoding(places);
  
  const filteredPlaces = useMemo(() => {
    if (selectedFeatures.length === 0) {
      return geocodedPlaces;
    }
    
    return geocodedPlaces.filter((place) => 
      selectedFeatures.some(feature => place.features.includes(feature))
    );
  }, [geocodedPlaces, selectedFeatures]);
  
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    let centerLat = 40.7128; // Default to NYC
    let centerLng = -74.006;
    
    const placesWithCoordinates = filteredPlaces.filter(p => p.coordinates);
    
    if (placesWithCoordinates.length > 0) {
      const sumLat = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[1] || 0), 0);
      const sumLng = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[0] || 0), 0);
      centerLat = sumLat / placesWithCoordinates.length;
      centerLng = sumLng / placesWithCoordinates.length;
    }
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 11.5,
      accessToken: mapboxToken
    });
    
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    setMap(newMap);
    
    return () => {
      newMap.remove();
    };
  }, [mapboxToken, filteredPlaces, map]);
  
  useEffect(() => {
    if (!map) return;
    
    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Add markers for places with coordinates
    filteredPlaces.forEach(place => {
      createMapMarker({
        place,
        map,
        onMarkerClick: setPopupInfo
      });
    });
  }, [filteredPlaces, map]);
  
  useEffect(() => {
    if (!map) return;
    
    const popups = document.querySelectorAll('.mapboxgl-popup');
    popups.forEach(popup => popup.remove());
    
    if (!popupInfo) return;
    
    const popup = createMapPopup(popupInfo, map);
    popup.on('close', () => setPopupInfo(null));
  }, [popupInfo, map]);

  if (isLoadingToken) {
    return <MapLoading />;
  }

  if (!mapboxToken) {
    return <MapError places={places} />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm" 
          onClick={() => navigator.geolocation.getCurrentPosition(
            position => {
              if (map) {
                map.flyTo({
                  center: [position.coords.longitude, position.coords.latitude],
                  zoom: 13
                });
              }
            }, 
            error => console.log('Error getting current position:', error)
          )}
        >
          My Location
        </Button>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
