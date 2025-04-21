
import { Place } from '@/types';
import mapboxgl from 'mapbox-gl';

interface MapMarkerProps {
  place: Place & { coordinates: [number, number] };
  map: mapboxgl.Map;
  onMarkerClick: (place: Place) => void;
}

export function createMapMarker({ place, map, onMarkerClick }: MapMarkerProps) {
  if (!place.coordinates || !map) {
    console.error('Cannot create marker: missing coordinates or map', {
      hasCoordinates: !!place.coordinates,
      mapLoaded: !!map,
      placeName: place.name
    });
    return null;
  }
  
  try {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#EA4335" stroke="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;
    el.style.cursor = 'pointer';
    el.style.width = '32px';
    el.style.height = '32px';
    
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click event
      console.log('Marker clicked for:', place.name);
      onMarkerClick(place);
    });
    
    return new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(place.coordinates)
      .addTo(map);
  } catch (error) {
    console.error('Error creating map marker:', error);
    return null;
  }
}
