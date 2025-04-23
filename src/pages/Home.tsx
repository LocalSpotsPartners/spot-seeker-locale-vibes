
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/map/MapView";
import { useMediaQuery } from "@react-hook/media-query";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);

  // For filtering based on map bounds (desktop only)
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  // Custom media query hook to determine desktop vs mobile
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('places').select('*');
        if (error) {
          throw error;
        }
        if (data) {
          const transformedPlaces: Place[] = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            images: item.images || [],
            features: (item.features || []).filter((feature): feature is PlaceFeature => ['rooftop', 'outdoor', 'coffee', 'wifi', 'bar', 'restaurant', 'quiet', 'view'].includes(feature)),
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

  // Filter places by features and (if desktop) map bounds
  const filteredPlaces = useMemo(() => {
    let filtered = places.filter(place => {
      // Feature filter
      const matchesFeatures = selectedFeatures.length === 0 || selectedFeatures.every(feature => place.features.includes(feature));
      return matchesFeatures;
    });

    if (
      isDesktop &&
      mapBounds &&
      !showMobileMap // Only filter when map is visible on desktop
    ) {
      filtered = filtered.filter(place => {
        if (!place.location || place.location.lat === 0 || place.location.lng === 0) return false;
        return (
          place.location.lat <= mapBounds.north &&
          place.location.lat >= mapBounds.south &&
          place.location.lng >= mapBounds.west &&
          place.location.lng <= mapBounds.east
        );
      });
    }

    return filtered;
  }, [places, selectedFeatures, mapBounds, isDesktop, showMobileMap]);

  // Receive new map bounds on desktop view and update state
  const handleMapViewportChange = (bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    if (isDesktop && !showMobileMap && bounds) {
      setMapBounds(bounds);
    }
  };

  const handlePlaceHover = (place: Place | null) => {
    setHoveredPlace(place);
  };

  return (
    <Layout>
      <div className="container py-8 pb-20 md:py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Local Spots</h1>
            <p className="text-gray-600">
              Explore our curated collection of local gems and hidden favorites
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 md:hidden" 
              onClick={() => setShowMobileMap(v => !v)} 
              aria-label="Toggle Map View"
            >
              <Map className="w-4 h-4" />
              {showMobileMap ? "Show List" : "Show Map"}
            </Button>
          </div>
        </div>

        <FeatureFilter onFilterChange={setSelectedFeatures} selectedFeatures={selectedFeatures} />

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading places...</p>
          </div>
        ) : (
          <div className="md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
            <div className={`${showMobileMap ? 'hidden md:block' : ''}`}>
              <PlaceGrid 
                places={filteredPlaces} 
                selectedFeatures={selectedFeatures} 
                onPlaceHover={handlePlaceHover} 
              />
            </div>
            <div className={`${!showMobileMap ? 'hidden md:block' : ''} md:sticky md:top-24 h-[calc(100vh-8rem)]`}>
              <MapView 
                places={places} 
                selectedFeatures={selectedFeatures} 
                hoveredPlace={hoveredPlace} 
                onViewportChange={handleMapViewportChange}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
