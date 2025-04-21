
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { Map, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/map/MapView";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

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

  const filteredPlaces = places.filter(place => {
    // Feature filter
    const matchesFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.every(feature => place.features.includes(feature));

    // Search query filter
    const matchesSearch = !searchQuery || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Map bounds filter
    const withinBounds = !mapBounds || (
      place.location.lat <= mapBounds.north &&
      place.location.lat >= mapBounds.south &&
      place.location.lng <= mapBounds.east &&
      place.location.lng >= mapBounds.west
    );

    return matchesFeatures && matchesSearch && withinBounds;
  });

  const handleMapViewportChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    setMapBounds(bounds);
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 md:hidden"
              onClick={() => setShowMobileMap((v) => !v)}
              aria-label="Toggle Map View"
            >
              <Map className="w-4 h-4" />
              {showMobileMap ? "Show List" : "Show Map"}
            </Button>
          </div>
        </div>

        <FeatureFilter 
          onFilterChange={setSelectedFeatures} 
          selectedFeatures={selectedFeatures}
        />

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
