
import { useState, useEffect } from "react";
import { PlaceFeature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Filter } from "lucide-react";

interface FeatureFilterProps {
  onFilterChange: (features: PlaceFeature[]) => void;
}

// All available features to filter by
const availableFeatures: PlaceFeature[] = [
  "rooftop",
  "outdoor",
  "coffee",
  "wifi",
  "bar",
  "restaurant",
  "quiet",
  "view"
];

export function FeatureFilter({ onFilterChange }: FeatureFilterProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);

  // Emits selected features to parent component
  useEffect(() => {
    onFilterChange(selectedFeatures);
  }, [selectedFeatures, onFilterChange]);

  // Feature toggling handler
  const handleValueChange = (values: string[]) => {
    setSelectedFeatures(values as PlaceFeature[]);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-5 w-5" />
        <h3 className="font-medium">Filter by features</h3>
      </div>
      
      <ToggleGroup 
        type="multiple"
        className="flex flex-wrap gap-2 justify-start"
        value={selectedFeatures}
        onValueChange={handleValueChange}
      >
        {availableFeatures.map(feature => (
          <ToggleGroupItem 
            key={feature} 
            value={feature}
            className="data-[state=on]:bg-locale-100 data-[state=on]:text-locale-800 border"
          >
            {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
