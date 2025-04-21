
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
import { toast } from 'sonner';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
}

export function MapView({ places, selectedFeatures }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Place | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoadingToken, error: mapboxError } = useMapbox();
  const { geocodedPlaces } = useGeocoding(places);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
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
    
    try {
      console.log('Initializing map with token', mapboxToken.substring(0, 5) + '...');
      mapboxgl.accessToken = mapboxToken;
      
      // Ensure the map container has proper dimensions
      if (mapContainer.current) {
        mapContainer.current.style.height = '100%';
        mapContainer.current.style.minHeight = '500px';
        mapContainer.current.style.width = '100%';
      }
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.006, 40.7128],
        zoom: 11.5,
        preserveDrawingBuffer: true
      });
      
      newMap.on('load', () => {
        console.log('Map loaded successfully');
        setMapInitialized(true);
      });
      
      newMap.on('error', (e) => {
        console.error('Map error:', e);
        toast.error('Error loading map: ' + e.error?.message || 'Unknown error');
      });
      
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      setMap(newMap);
      
      return () => {
        console.log('Cleaning up map');
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        newMap.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      toast.error('Failed to initialize map: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [mapboxToken]);
  
  useEffect(() => {
    if (!map || !mapInitialized || filteredPlaces.length === 0) return;
    
    const placesWithCoordinates = filteredPlaces.filter(p => p.coordinates);
    
    if (placesWithCoordinates.length > 0) {
      const sumLat = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[1] || 0), 0);
      const sumLng = placesWithCoordinates.reduce((sum, place) => sum + (place.coordinates?.[0] || 0), 0);
      const centerLat = sumLat / placesWithCoordinates.length;
      const centerLng = sumLng / placesWithCoordinates.length;
      
      map.setCenter([centerLng, centerLat]);
      console.log('Map center set to:', [centerLng, centerLat]);
    }
  }, [map, mapInitialized, filteredPlaces]);
  
  // Add markers to the map
  useEffect(() => {
    if (!map || !mapInitialized) {
      console.log('Cannot add markers: map not ready', {
        mapExists: !!map,
        isInitialized: mapInitialized
      });
      return;
    }
    
    console.log('Adding markers for', filteredPlaces.length, 'places');
    console.log('Places with coordinates:', filteredPlaces.filter(p => p.coordinates).length);
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add new markers
    filteredPlaces.forEach(place => {
      if (place.coordinates) {
        const marker = createMapMarker({
          place: place as Place & { coordinates: [number, number] },
          map,
          onMarkerClick: setPopupInfo
        });
        
        if (marker) {
          markersRef.current.push(marker);
        }
      } else {
        console.log(`No coordinates for ${place.name}`);
      }
    });
    
    console.log('Created', markersRef.current.length, 'markers');
  }, [filteredPlaces, map, mapInitialized]);
  
  useEffect(() => {
    if (!map || !mapInitialized) return;
    
    const popups = document.querySelectorAll('.mapboxgl-popup');
    popups.forEach(popup => popup.remove());
    
    if (popupInfo && popupInfo.coordinates) {
      const popup = createMapPopup(popupInfo, map);
      if (popup) {
        popup.on('close', () => setPopupInfo(null));
      }
    }
  }, [popupInfo, map, mapInitialized]);

  if (isLoadingToken) {
    return <MapLoading />;
  }

  if (mapboxError || !mapboxToken) {
    return <MapError places={places} />;
  }

  return (
    <div className="h-full w-full bg-gray-100 relative" style={{ minHeight: '500px' }}>
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
            error => {
              console.log('Error getting current position:', error);
            }
          )}
        >
          My Location
        </Button>
      </div>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white p-2 rounded shadow text-xs">
          {filteredPlaces.filter(p => p.coordinates).length} locations on map
        </div>
      </div>
    </div>
  );
}
