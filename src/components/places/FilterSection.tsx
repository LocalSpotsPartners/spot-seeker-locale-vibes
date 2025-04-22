
import { PlaceFeature } from "@/types";
import { FeatureFilter } from "./FeatureFilter";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

interface FilterSectionProps {
  selectedFeatures: PlaceFeature[];
  onFilterChange: (features: PlaceFeature[]) => void;
  showMobileMap: boolean;
  onToggleMap: () => void;
}

export function FilterSection({ 
  selectedFeatures, 
  onFilterChange, 
  showMobileMap, 
  onToggleMap 
}: FilterSectionProps) {
  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discover Local Spots</h1>
          <p className="text-gray-600">
            Explore our curated collection of local gems and hidden favorites
          </p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 md:hidden" 
          onClick={onToggleMap} 
          aria-label="Toggle Map View"
        >
          <Map className="w-4 h-4" />
          {showMobileMap ? "Show List" : "Show Map"}
        </Button>
      </div>

      <FeatureFilter 
        onFilterChange={onFilterChange} 
        selectedFeatures={selectedFeatures} 
      />
    </>
  );
}
