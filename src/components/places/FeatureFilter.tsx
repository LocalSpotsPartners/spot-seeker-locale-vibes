
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
  // Initialize state with an empty array
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
      
      <div className="flex flex-wrap gap-2 justify-start">
        {availableFeatures.map(feature => (
          <Badge 
            key={feature}
            variant="outline"
            className={`cursor-pointer ${
              selectedFeatures.includes(feature) 
                ? "bg-locale-100 text-locale-800" 
                : ""
            }`}
            onClick={() => {
              setSelectedFeatures(prev => 
                prev.includes(feature)
                  ? prev.filter(item => item !== feature)
                  : [...prev, feature]
              );
            }}
          >
            {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
