
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

export const useUserLocation = (map: mapboxgl.Map | null, mapInitialized: boolean) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !mapInitialized || !userLocation) return;
    
    if (userLocationMarker) {
      userLocationMarker.setLngLat(userLocation);
    } else {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `;
      
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(userLocation)
        .addTo(map);
      
      setUserLocationMarker(marker);
    }
  }, [map, mapInitialized, userLocation]);

  const handleUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userCoords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];
        
        setUserLocation(userCoords);
        
        if (map) {
          map.flyTo({
            center: userCoords,
            zoom: 14,
            duration: 2000
          });
        }
      },
      error => {
        console.error('Error getting user location:', error);
        toast.error('Could not get your location. Please check your browser permissions.');
      }
    );
  };

  return { handleUserLocation, userLocationMarker };
};
