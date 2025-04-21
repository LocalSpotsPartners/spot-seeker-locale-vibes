import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/map/MapView";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*');
        
        if (error) {
          throw error;
        }

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
      <div className="container py-8 pb-20">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Local Spots</h1>
            <p className="text-gray-600">
              Explore our curated collection of local gems and hidden favorites
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowMap((v) => !v)}
            aria-label="Toggle Map View"
          >
            <Map className="w-4 h-4" />
            {showMap ? "Show List" : "Show Map"}
          </Button>
        </div>

        <FeatureFilter onFilterChange={setSelectedFeatures} />

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading places...</p>
          </div>
        ) : showMap ? (
          <div className="pt-6">
            <MapView places={places} selectedFeatures={selectedFeatures} />
          </div>
        ) : (
          <PlaceGrid places={places} selectedFeatures={selectedFeatures} />
        )}
      </div>
    </Layout>
  );
}
