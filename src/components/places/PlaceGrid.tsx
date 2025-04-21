
import { useMemo } from "react";
import { Place, PlaceFeature } from "@/types";
import { PlaceCard } from "./PlaceCard";

interface PlaceGridProps {
  places: Place[];
  selectedFeatures: PlaceFeature[];
}

export function PlaceGrid({ places, selectedFeatures }: PlaceGridProps) {
  // Filter places based on selected features
  const filteredPlaces = useMemo(() => {
    if (selectedFeatures.length === 0) {
      return places;
    }
    
    return places.filter((place) => 
      selectedFeatures.some(feature => place.features.includes(feature))
    );
  }, [places, selectedFeatures]);

  if (filteredPlaces.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No places found</h3>
        <p className="text-gray-500">Try changing your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {filteredPlaces.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
