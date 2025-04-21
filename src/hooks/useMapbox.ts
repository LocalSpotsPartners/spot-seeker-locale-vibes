
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapbox = () => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        setIsLoadingToken(true);
        setError(null);
        
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data && data.token) {
          console.log('Successfully received Mapbox token');
          setMapboxToken(data.token);
        } else {
          throw new Error('No Mapbox token returned from the function');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching Mapbox token'));
      } finally {
        setIsLoadingToken(false);
      }
    };
    
    fetchMapboxToken();
  }, []);
  
  return { mapboxToken, isLoadingToken, error };
};
