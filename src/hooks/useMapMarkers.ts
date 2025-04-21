
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Place } from '@/types';
import { createMapMarker } from '@/components/map/MapMarker';

interface UseMapMarkersProps {
  map: mapboxgl.Map | null;
  mapInitialized: boolean;
  filteredPlaces: Place[];
  hoveredPlace: Place | null;
  onMarkerClick: (place: Place) => void;
}

export const useMapMarkers = ({ 
  map, 
  mapInitialized, 
  filteredPlaces, 
  hoveredPlace, 
  onMarkerClick 
}: UseMapMarkersProps) => {
  const markersRef = useRef<{marker: mapboxgl.Marker, place: Place}[]>([]);

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
    
    markersRef.current.forEach(({marker}) => marker.remove());
    markersRef.current = [];
    
    filteredPlaces.forEach(place => {
      if (place.coordinates) {
        const isHighlighted = hoveredPlace && hoveredPlace.id === place.id;
        
        const marker = createMapMarker({
          place: place as Place & { coordinates: [number, number] },
          map,
          onMarkerClick,
          isHighlighted
        });
        
        if (marker) {
          const el = marker.getElement();
          el.classList.add('place-marker');
          
          if (isHighlighted) {
            el.classList.add('hovered-marker');
          }
          
          markersRef.current.push({marker, place});
        }
      } else {
        console.log(`No coordinates for ${place.name}`);
      }
    });
    
    console.log('Created', markersRef.current.length, 'markers');
    
    const style = document.createElement('style');
    style.textContent = `
      .place-marker {
        transition: transform 0.3s ease;
      }
      .hovered-marker {
        transform: scale(1.3);
        z-index: 10;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      markersRef.current.forEach(({marker}) => marker.remove());
      markersRef.current = [];
      document.head.removeChild(style);
    };
  }, [filteredPlaces, map, mapInitialized, hoveredPlace, onMarkerClick]);

  return markersRef;
};
