
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { Place, PlaceFeature } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

// Define the MapViewProps interface
interface MapViewProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
}

export function MapView({ places, selectedFeatures }: MapViewProps) {
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 11.5
  });
  const [popupInfo, setPopupInfo] = useState<Place | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Fetch Mapbox token from Supabase edge function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        setIsLoadingToken(true);
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setMapboxToken(null);
        } else if (data && data.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setMapboxToken(null);
      } finally {
        setIsLoadingToken(false);
      }
    };
    
    fetchMapboxToken();
  }, []);
  
  const filteredPlaces = useMemo(() => {
    if (selectedFeatures.length === 0) {
      return places;
    }
    
    return places.filter((place) => 
      selectedFeatures.some(feature => place.features.includes(feature))
    );
  }, [places, selectedFeatures]);
  
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    let centerLat = 40.7128; // Default to NYC
    let centerLng = -74.006;
    
    if (filteredPlaces.length > 0) {
      const sumLat = filteredPlaces.reduce((sum, place) => sum + place.location.lat, 0);
      const sumLng = filteredPlaces.reduce((sum, place) => sum + place.location.lng, 0);
      centerLat = sumLat / filteredPlaces.length;
      centerLng = sumLng / filteredPlaces.length;
    }
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 11.5,
      accessToken: mapboxToken
    });
    
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    setMap(newMap);
    
    return () => {
      newMap.remove();
    };
  }, [mapboxToken, filteredPlaces, map]);
  
  useEffect(() => {
    if (!map) return;
    
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    filteredPlaces.forEach(place => {
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
        setPopupInfo(place);
      });
      
      new mapboxgl.Marker(el)
        .setLngLat([place.location.lng, place.location.lat])
        .addTo(map);
    });
  }, [filteredPlaces, map]);
  
  useEffect(() => {
    if (!map) return;
    
    const popups = document.querySelectorAll('.mapboxgl-popup');
    popups.forEach(popup => popup.remove());
    
    if (!popupInfo) return;
    
    const popupNode = document.createElement('div');
    
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-md shadow-sm w-[260px]';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-start mb-2';
    
    const title = document.createElement('h3');
    title.className = 'font-semibold text-sm';
    title.textContent = popupInfo.name;
    
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'flex items-center';
    ratingContainer.innerHTML = `
      <svg class="h-3 w-3 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      <span class="text-xs font-medium">${popupInfo.rating.toFixed(1)}</span>
    `;
    
    header.appendChild(title);
    header.appendChild(ratingContainer);
    
    const address = document.createElement('p');
    address.className = 'text-xs text-gray-500 mb-2';
    address.textContent = popupInfo.location.address;
    
    const features = document.createElement('div');
    features.className = 'flex flex-wrap gap-1 mb-2';
    
    const featuresToShow = popupInfo.features.slice(0, 3);
    featuresToShow.forEach(feature => {
      const badge = document.createElement('span');
      badge.className = 'bg-gray-100 text-gray-800 text-[10px] py-0.5 px-1.5 rounded';
      badge.textContent = feature;
      features.appendChild(badge);
    });
    
    if (popupInfo.features.length > 3) {
      const moreBadge = document.createElement('span');
      moreBadge.className = 'bg-gray-100 text-gray-800 text-[10px] py-0.5 px-1.5 rounded';
      moreBadge.textContent = `+${popupInfo.features.length - 3}`;
      features.appendChild(moreBadge);
    }
    
    const viewButton = document.createElement('a');
    viewButton.className = 'bg-locale-500 hover:bg-locale-600 text-white text-xs font-medium py-1 px-2 rounded block text-center w-full';
    viewButton.href = `/place/${popupInfo.id}`;
    viewButton.textContent = 'View Details';
    
    card.appendChild(header);
    card.appendChild(address);
    card.appendChild(features);
    card.appendChild(viewButton);
    
    popupNode.appendChild(card);
    
    new mapboxgl.Popup({ offset: 25, closeButton: true })
      .setLngLat([popupInfo.location.lng, popupInfo.location.lat])
      .setDOMContent(popupNode)
      .addTo(map)
      .on('close', () => setPopupInfo(null));
  }, [popupInfo, map]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
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
            error => console.log('Error getting current position:', error)
          )}
        >
          My Location
        </Button>
      </div>
    
      {isLoadingToken ? (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
          <p className="ml-3 text-gray-600">Loading map...</p>
        </div>
      ) : !mapboxToken ? (
        <div className="h-full flex items-center justify-center bg-gray-100 flex-col">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Map View</h2>
            <p className="mb-4">
              Unable to load the map. Please make sure the Mapbox token is correctly configured in Supabase.
            </p>
            <div className="text-sm text-gray-500">
              This is a placeholder until a valid Mapbox token is provided.
            </div>
            
            <div className="mt-6">
              <div className="text-left mb-4">
                <h3 className="font-medium mb-2">Places that would appear on the map:</h3>
                <ul className="text-sm list-disc list-inside">
                  {filteredPlaces.map(place => (
                    <li key={place.id} className="mb-1">{place.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full" />
      )}
    </div>
  );
}
