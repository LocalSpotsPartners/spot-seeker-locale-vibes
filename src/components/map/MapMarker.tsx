
import { Place } from '@/types';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';

interface MapMarkerProps {
  place: Place & { coordinates: [number, number] };
  map: mapboxgl.Map;
  onMarkerClick: (place: Place) => void;
}

export function createMapMarker({ place, map, onMarkerClick }: MapMarkerProps) {
  if (!place.coordinates || !map || !map.loaded()) {
    console.log('Cannot create marker: map not loaded or coordinates missing', {
      hasCoordinates: !!place.coordinates,
      mapLoaded: map?.loaded(),
      placeName: place.name
    });
    return null;
  }
  
  try {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(20, 173, 224)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    el.style.cursor = 'pointer';
    
    el.addEventListener('click', () => {
      onMarkerClick(place);
    });
    
    return new mapboxgl.Marker(el)
      .setLngLat(place.coordinates)
      .addTo(map);
  } catch (error) {
    console.error('Error creating map marker:', error);
    return null;
  }
}

