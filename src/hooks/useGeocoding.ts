import { useState, useEffect } from 'react';
import { Place } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useGeocoding = (places: Place[]) => {
  const [geocodedPlaces, setGeocodedPlaces] = useState<Place[]>([]);
  
  useEffect(() => {
    const geocodePlaces = async () => {
      try {
        console.log('Starting geocoding for', places.length, 'places');
        const geocodedResults = await Promise.all(
          places.map(async (place) => {
            // If the place already has coordinates from lat/lng
            if (place.location.lng !== 0 && place.location.lat !== 0) {
              console.log(`Place ${place.name} already has coordinates:`, [place.location.lng, place.location.lat]);
              return {
                ...place,
                coordinates: [place.location.lng, place.location.lat] as [number, number]
              };
            }
            
            // Otherwise try geocoding the address
            try {
              const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
                body: { address: place.location.address }
              });
              
              if (error) {
                console.error('Error geocoding address:', error);
                return place;
              }
              
              if (data?.geocoding) {
                console.log(`Geocoded ${place.name} to:`, data.geocoding);
                return {
                  ...place,
                  coordinates: data.geocoding as [number, number]
                };
              }
            } catch (err) {
              console.error(`Error geocoding ${place.name}:`, err);
            }
            
            return place;
          })
        );
        
        console.log('Geocoding completed:', geocodedResults.filter(p => p.coordinates).length, 'places have coordinates');
        setGeocodedPlaces(geocodedResults);
      } catch (err) {
        console.error('Failed to geocode addresses:', err);
      }
    };
    
    if (places.length > 0) {
      geocodePlaces();
    } else {
      setGeocodedPlaces([]);
    }
  }, [places]);
  
  return { geocodedPlaces };
};
