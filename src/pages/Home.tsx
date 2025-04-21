
import { useState, useEffect, useMemo, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature, Place } from "@/types";
import { Map, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/map/MapView";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  
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

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const lowercaseQuery = searchQuery.toLowerCase();
    
    // Get unique neighborhoods
    const neighborhoodSuggestions = Array.from(
      new Set(places.map(p => p.neighborhood).filter(Boolean))
    )
      .filter(neighborhood => 
        neighborhood?.toLowerCase().includes(lowercaseQuery)
      )
      .map(neighborhood => ({
        type: 'neighborhood',
        value: neighborhood || ''
      }));
    
    // Get place names
    const nameSuggestions = places
      .filter(p => p.name.toLowerCase().includes(lowercaseQuery))
      .map(p => ({
        type: 'name',
        value: p.name
      }));

    // Return only neighborhood and name suggestions
    return [...neighborhoodSuggestions, ...nameSuggestions].slice(0, 5);
  }, [places, searchQuery]);
  
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Feature filter
      const matchesFeatures = selectedFeatures.length === 0 || selectedFeatures.every(feature => place.features.includes(feature));

      // Search query filter - only filter by name and neighborhood
      const matchesSearch = !searchQuery || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (place.neighborhood && place.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()));
        
      // Map bounds filter for desktop only
      const matchesBounds = !mapBounds || 
        (place.location &&
          place.location.lat <= mapBounds.north &&
          place.location.lat >= mapBounds.south &&
          place.location.lng <= mapBounds.east &&
          place.location.lng >= mapBounds.west);
      
      return matchesFeatures && matchesSearch && matchesBounds;
    });
  }, [places, selectedFeatures, searchQuery, mapBounds]);
  
  const handleMapViewportChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    console.log("Map viewport changed, filtering places by bounds");
    setMapBounds(bounds);
  };
  
  const handlePlaceHover = (place: Place | null) => {
    setHoveredPlace(place);
  };
  
  const handleSearchSelection = (value: string) => {
    setSearchQuery(value);
    setSearchOpen(false);
  };

  // Focus the input after selecting a suggestion
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  return <Layout>
      <div className="container py-8 pb-20 md:py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Local Spots</h1>
            <p className="text-gray-600">
              Explore our curated collection of local gems and hidden favorites
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search by name or neighborhood..." 
                value={searchQuery} 
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setSearchOpen(true);
                  } else {
                    setSearchOpen(false);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim() !== '') {
                    setSearchOpen(true);
                  }
                }}
                className="pl-9 md:text-base w-full" 
              />
              
              {searchSuggestions.length > 0 && (
                <Popover 
                  open={searchOpen} 
                  onOpenChange={(open) => {
                    // Only allow closing the popover, never auto-open it
                    if (!open) setSearchOpen(false);
                  }}
                >
                  <PopoverTrigger asChild>
                    <div className="w-0 h-0 overflow-hidden" />
                  </PopoverTrigger>
                  <PopoverContent 
                    className="p-0 w-[300px]" 
                    align="start" 
                    sideOffset={5}
                    onEscapeKeyDown={() => setSearchOpen(false)}
                    onInteractOutside={() => {
                      // Don't immediately close to allow selection
                      setTimeout(() => setSearchOpen(false), 100);
                    }}
                  >
                    <Command loop={false} shouldFilter={false} className="remove-auto-focus">
                      <style jsx global>{`
                        .remove-auto-focus [cmdk-item][data-selected] {
                          background: transparent;
                          color: inherit;
                        }
                        .remove-auto-focus [cmdk-item]:hover {
                          background: var(--accent);
                          color: var(--accent-foreground);
                        }
                      `}</style>
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {searchSuggestions.map(suggestion => (
                            <CommandItem 
                              key={`${suggestion.type}-${suggestion.value}`} 
                              onSelect={() => {
                                handleSearchSelection(suggestion.value);
                                setTimeout(focusSearchInput, 100);
                              }} 
                              className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              value={suggestion.value}
                            >
                              {suggestion.type === 'neighborhood' ? 
                                <Map className="h-4 w-4 text-gray-400" /> : 
                                <Search className="h-4 w-4 text-gray-400" />
                              }
                              <span className="text-base">{suggestion.value}</span>
                              <span className="text-xs text-gray-400 ml-auto">
                                {suggestion.type === 'neighborhood' ? 'Neighborhood' : 'Place'}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
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
    </Layout>;
}
