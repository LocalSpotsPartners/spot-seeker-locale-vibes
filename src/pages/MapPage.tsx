import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { MapView } from "@/components/map/MapView";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching places from Supabase...');
        
        const { data, error } = await supabase
          .from('places')
          .select('*');
        
        if (error) {
          console.error('Error fetching places:', error);
          toast.error('Failed to load places');
          throw error;
        }
        
        if (data) {
          console.log('Places loaded:', data.length);
          const transformedPlaces: Place[] = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            images: item.images || [],
            features: (item.features || []).filter((feature): feature is PlaceFeature => 
              ['rooftop', 'outdoor', 'coffee', 'wifi', 'bar', 'restaurant', 'quiet', 'view'].includes(feature)
            ),
            rating: item.rating || 0,
            location: {
              lat: Number(item.lat) || 0,
              lng: Number(item.lng) || 0,
              address: item.address || ''
            }
          }));
          setPlaces(transformedPlaces);
          console.log('Places with coordinates:', transformedPlaces.filter(p => p.location.lat !== 0 && p.location.lng !== 0).length);
        }
      } catch (error) {
        console.error("Failed to load places:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    if (selectedFeatures.length === 0) return places;
    return places.filter(place => 
      selectedFeatures.every(feature => place.features.includes(feature))
    );
  }, [places, selectedFeatures]);

  return (
    <Layout>
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm shadow-md p-4">
          <FeatureFilter 
            onFilterChange={setSelectedFeatures} 
            selectedFeatures={selectedFeatures}
          />
        </div>
        
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="ml-3 text-gray-600">Loading places...</p>
          </div>
        ) : (
          <div className="pt-20 h-[calc(100%-5rem)]" style={{ minHeight: '500px' }}>
            <MapView places={filteredPlaces} selectedFeatures={selectedFeatures} />
          </div>
        )}
      </div>
    </Layout>
  );
}
