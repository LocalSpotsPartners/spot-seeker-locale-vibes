
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        
        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }
        
        if (data && data.token) {
          console.log('Successfully received Mapbox token:', data.token.substring(0, 5) + '...');
          setMapboxToken(data.token);
        } else {
          console.error('No token in response:', data);
          throw new Error('No Mapbox token returned from the function');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching Mapbox token'));
        toast.error('Failed to load map: Could not get Mapbox token');
      } finally {
        setIsLoadingToken(false);
      }
    };
    
    fetchMapboxToken();
  }, []);
  
  return { mapboxToken, isLoadingToken, error };
};
