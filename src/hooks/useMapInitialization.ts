
import { useState, useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

interface MapConfig {
  mapContainer: RefObject<HTMLDivElement>;
  mapboxToken: string | null;
  onMapLoad?: () => void;
}

export const useMapInitialization = ({ mapContainer, mapboxToken, onMapLoad }: MapConfig) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map) return;
    
    try {
      console.log('Initializing map with token', mapboxToken.substring(0, 5) + '...');
      mapboxgl.accessToken = mapboxToken;
      
      // Ensure the container has proper dimensions before initializing the map
      if (mapContainer.current) {
        mapContainer.current.style.height = '100%';
        mapContainer.current.style.minHeight = '500px';
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.position = 'relative'; // Add position:relative
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
        onMapLoad?.();
      });
      
      newMap.on('error', (e) => {
        console.error('Map error:', e);
        toast.error('Error loading map: ' + e.error?.message || 'Unknown error');
      });
      
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      setMap(newMap);
      
      return () => {
        console.log('Cleaning up map');
        newMap.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      toast.error('Failed to initialize map: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [mapboxToken, onMapLoad, mapContainer]);

  return { map, mapInitialized };
};
