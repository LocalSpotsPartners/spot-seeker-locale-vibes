
import { Place } from '@/types';
import mapboxgl from 'mapbox-gl';

interface MapMarkerProps {
  place: Place & { coordinates?: [number, number] };
  map: mapboxgl.Map;
  onMarkerClick: (place: Place) => void;
}

export function createMapMarker({ place, map, onMarkerClick }: MapMarkerProps) {
  if (!place.coordinates) return null;
  
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.backgroundColor = 'rgb(20, 173, 224)';
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.color = 'white';
  el.style.fontWeight = 'bold';
  el.style.fontSize = '12px';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  el.innerText = place.rating.toFixed(1);
  
  el.addEventListener('click', () => {
    onMarkerClick(place);
  });
  
  return new mapboxgl.Marker(el)
    .setLngLat(place.coordinates)
    .addTo(map);
}
