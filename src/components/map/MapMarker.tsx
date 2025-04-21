
import { Place } from '@/types';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';

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
    // Create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4957" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ff4957"></circle></svg>`;
    el.style.cursor = 'pointer';
    el.style.width = '32px';
    el.style.height = '32px';
    
    // Add event listener to the marker
    el.addEventListener('click', () => {
      console.log('Marker clicked:', place.name);
      onMarkerClick(place);
    });
    
    console.log(`Creating marker for ${place.name} at:`, place.coordinates);
    
    // Create and return the marker
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
