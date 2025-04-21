
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { MapView } from "@/components/map/MapView";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
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
        }
      } catch (error) {
        console.error("Failed to load places:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaces();
  }, []);

  return (
    <Layout>
      <div className="relative h-[calc(100vh-4rem)]">
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm shadow-md p-4">
          <FeatureFilter onFilterChange={setSelectedFeatures} />
        </div>
        
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="ml-3 text-gray-600">Loading map...</p>
          </div>
        ) : (
          <div className="pt-24">
            <MapView places={places} selectedFeatures={selectedFeatures} />
          </div>
        )}
      </div>
    </Layout>
  );
}
