
import { Place, PlaceFeature } from "@/types";
import { PlaceGrid } from "./PlaceGrid";
import { MapView } from "@/components/map/MapView";

interface PlacesDisplayProps {
  filteredPlaces: Place[];
  places: Place[];
  selectedFeatures: PlaceFeature[];
  showMobileMap: boolean;
  hoveredPlace: Place | null;
  onPlaceHover: (place: Place | null) => void;
  onViewportChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

export function PlacesDisplay({
  filteredPlaces,
  places,
  selectedFeatures,
  showMobileMap,
  hoveredPlace,
  onPlaceHover,
  onViewportChange
}: PlacesDisplayProps) {
  return (
    <div className="md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
      <div className={`${showMobileMap ? 'hidden md:block' : ''}`}>
        <PlaceGrid 
          places={filteredPlaces} 
          selectedFeatures={selectedFeatures} 
          onPlaceHover={onPlaceHover} 
        />
      </div>
      <div className={`${!showMobileMap ? 'hidden md:block' : ''} md:sticky md:top-24 h-[calc(100vh-8rem)]`}>
        <MapView 
          places={places} 
          selectedFeatures={selectedFeatures} 
          hoveredPlace={hoveredPlace} 
          onViewportChange={onViewportChange}
        />
      </div>
    </div>
  );
}
