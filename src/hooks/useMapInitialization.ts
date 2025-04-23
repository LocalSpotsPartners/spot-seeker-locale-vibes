
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
      
      // Ensure container has proper dimensions before initializing the map
      if (mapContainer.current) {
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.height = '100%';
        mapContainer.current.style.minHeight = '500px';
        mapContainer.current.style.position = 'relative';
        mapContainer.current.style.display = 'block';
        mapContainer.current.style.visibility = 'visible';
        mapContainer.current.style.opacity = '1';
      }
      
      // Create the map with a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          if (!mapContainer.current) {
            console.error('Map container is not available');
            return;
          }

          console.log('Creating map instance...');
          const containerDimensions = mapContainer.current.getBoundingClientRect();
          console.log('Container dimensions:', {
            width: containerDimensions.width,
            height: containerDimensions.height,
            isVisible: containerDimensions.width > 0 && containerDimensions.height > 0
          });
          
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
        } catch (err) {
          console.error('Error creating map instance:', err);
          toast.error('Failed to create map: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      }, 100);
    } catch (err) {
      console.error('Error initializing map:', err);
      toast.error('Failed to initialize map: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    
    return () => {
      if (map) {
        console.log('Cleaning up map');
        map.remove();
      }
    };
  }, [mapboxToken, onMapLoad, mapContainer, map]);

  return { map, mapInitialized };
};
