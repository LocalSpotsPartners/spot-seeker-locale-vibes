
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
import { HighlightedPlace } from './HighlightedPlace';
import { MapPin } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
  hoveredPlace?: Place | null;
}

export function MapView({ places, selectedFeatures, hoveredPlace }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Place | null>(null);
  const [highlightedPlace, setHighlightedPlace] = useState<Place | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<mapboxgl.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoadingToken, error: mapboxError } = useMapbox();
  const { geocodedPlaces } = useGeocoding(places);
  const markersRef = useRef<{marker: mapboxgl.Marker, place: Place}[]>([]);

  const filteredPlaces = useMemo(() => {
    if (selectedFeatures.length === 0) {
      return geocodedPlaces;
    }
    
    return geocodedPlaces.filter((place) => 
      selectedFeatures.every(feature => place.features.includes(feature))
    );
  }, [geocodedPlaces, selectedFeatures]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map) return;
    
    try {
      console.log('Initializing map with token', mapboxToken.substring(0, 5) + '...');
      mapboxgl.accessToken = mapboxToken;
      
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
        markersRef.current.forEach(({marker}) => marker.remove());
        markersRef.current = [];
        if (userLocationMarker) userLocationMarker.remove();
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
  
  // Add or update user location marker
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
  
  // Effect for handling the hovered place
  useEffect(() => {
    if (!map || !mapInitialized || !hoveredPlace) return;
    
    // Find the marker for the hovered place
    const markerObj = markersRef.current.find(m => m.place.id === hoveredPlace.id);
    if (markerObj) {
      // Highlight the marker
      const markerEl = markerObj.marker.getElement();
      markerEl.classList.add('hovered-marker');
      
      // Center the map on the hovered place if it has coordinates
      if (hoveredPlace.coordinates) {
        map.easeTo({
          center: hoveredPlace.coordinates,
          duration: 800
        });
      }
      
      setHighlightedPlace(hoveredPlace);
      
      return () => {
        markerEl.classList.remove('hovered-marker');
        if (!hoveredPlace) {
          setHighlightedPlace(null);
        }
      };
    }
  }, [map, mapInitialized, hoveredPlace]);
  
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
        const marker = createMapMarker({
          place: place as Place & { coordinates: [number, number] },
          map,
          onMarkerClick: (clickedPlace) => {
            console.log('Marker clicked for place:', clickedPlace.name);
            setPopupInfo(null); // Close any existing popup
            setHighlightedPlace(clickedPlace); // Show the highlighted place widget
          }
        });
        
        if (marker) {
          // Add CSS class for styling
          const el = marker.getElement();
          el.classList.add('place-marker');
          
          // Add hover effect
          if (hoveredPlace && hoveredPlace.id === place.id) {
            el.classList.add('hovered-marker');
          }
          
          markersRef.current.push({marker, place});
        }
      } else {
        console.log(`No coordinates for ${place.name}`);
      }
    });
    
    console.log('Created', markersRef.current.length, 'markers');
    
    // Add CSS for marker highlighting
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
      document.head.removeChild(style);
    };
  }, [filteredPlaces, map, mapInitialized, hoveredPlace]);
  
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

  // Handle user location
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

  if (isLoadingToken) {
    return <MapLoading />;
  }

  if (mapboxError || !mapboxToken) {
    return <MapError places={places} />;
  }

  return (
    <div className="h-full w-full bg-gray-100 relative" style={{ minHeight: '500px' }}>
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleUserLocation}
        >
          <MapPin className="h-4 w-4 mr-1" />
          My Location
        </Button>
      </div>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '500px' }} />
      {highlightedPlace && (
        <div className="absolute top-4 left-4 z-10">
          <HighlightedPlace place={highlightedPlace} />
        </div>
      )}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white p-2 rounded shadow text-xs">
          {filteredPlaces.filter(p => p.coordinates).length} locations on map
        </div>
      </div>
    </div>
  );
}
