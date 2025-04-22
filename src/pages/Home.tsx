
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Place, PlaceFeature } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { FilterSection } from "@/components/places/FilterSection";
import { PlacesDisplay } from "@/components/places/PlacesDisplay";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const { data, error } = await supabase.from('places').select('*');
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
            },
            neighborhood: item.neighborhood || ''
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

  const filteredPlaces = places.filter(place => {
    const matchesFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.every(feature => place.features.includes(feature));
    
    const matchesBounds = !mapBounds || 
      (place.location &&
        place.location.lat <= mapBounds.north &&
        place.location.lat >= mapBounds.south &&
        place.location.lng <= mapBounds.east &&
        place.location.lng >= mapBounds.west);
    
    return matchesFeatures && matchesBounds;
  });

  const handleMapViewportChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    setMapBounds(bounds);
  };

  return (
    <Layout>
      <div className="container py-8 pb-20 md:py-8">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading places...</p>
          </div>
        ) : (
          <>
            <FilterSection
              selectedFeatures={selectedFeatures}
              onFilterChange={setSelectedFeatures}
              showMobileMap={showMobileMap}
              onToggleMap={() => setShowMobileMap(v => !v)}
            />
            <PlacesDisplay
              filteredPlaces={filteredPlaces}
              places={places}
              selectedFeatures={selectedFeatures}
              showMobileMap={showMobileMap}
              hoveredPlace={hoveredPlace}
              onPlaceHover={setHoveredPlace}
              onViewportChange={handleMapViewportChange}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
