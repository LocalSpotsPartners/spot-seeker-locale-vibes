
import { useState, useEffect } from 'react';
import { Place } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useGeocoding = (places: Place[]) => {
  const [geocodedPlaces, setGeocodedPlaces] = useState<(Place & { coordinates?: [number, number] })[]>([]);
  
  useEffect(() => {
    const geocodePlaces = async () => {
      try {
        const geocodedResults = await Promise.all(
          places.map(async (place) => {
            if (place.location.lng !== 0 && place.location.lat !== 0) {
              return {
                ...place,
                coordinates: [place.location.lng, place.location.lat]
              };
            }
            
            const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
              body: { address: place.location.address }
            });
            
            if (error) {
              console.error('Error geocoding address:', error);
              return place;
            }
            
            if (data.geocoding) {
              return {
                ...place,
                coordinates: data.geocoding
              };
            }
            
            return place;
          })
        );
        
        setGeocodedPlaces(geocodedResults);
      } catch (err) {
        console.error('Failed to geocode addresses:', err);
      }
    };
    
    geocodePlaces();
  }, [places]);
  
  return { geocodedPlaces };
};
