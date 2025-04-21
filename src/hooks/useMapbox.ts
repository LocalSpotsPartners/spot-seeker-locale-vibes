
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapbox = () => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        setIsLoadingToken(true);
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data && data.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
      } finally {
        setIsLoadingToken(false);
      }
    };
    
    fetchMapboxToken();
  }, []);
  
  return { mapboxToken, isLoadingToken };
};
