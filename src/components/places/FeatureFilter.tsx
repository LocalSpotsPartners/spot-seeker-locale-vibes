
import { useMemo } from "react";
import { PlaceFeature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface FeatureFilterProps {
  onFilterChange: (features: PlaceFeature[]) => void;
  selectedFeatures: PlaceFeature[];
}

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

export function FeatureFilter({ onFilterChange, selectedFeatures }: FeatureFilterProps) {
  const handleFeatureToggle = (feature: PlaceFeature) => {
    if (selectedFeatures.includes(feature)) {
      onFilterChange(selectedFeatures.filter(f => f !== feature));
    } else {
      onFilterChange([...selectedFeatures, feature]);
    }
  };

  const selectedText = useMemo(() => {
    if (!selectedFeatures || selectedFeatures.length === 0) return '';
    return `Selected: ${selectedFeatures.join(', ')}`;
  }, [selectedFeatures]);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-5 w-5" />
        <h3 className="font-medium">Filter by features</h3>
      </div>
      
      {selectedText && (
        <p className="text-sm text-gray-600 mb-2">{selectedText}</p>
      )}
      
      <div className="flex flex-wrap gap-2 justify-start">
        {availableFeatures.map(feature => (
          <Badge 
            key={feature}
            variant="outline"
            className={`cursor-pointer ${
              selectedFeatures?.includes(feature) 
                ? "bg-locale-100 text-locale-800 border-locale-800" 
                : ""
            }`}
            onClick={() => handleFeatureToggle(feature)}
          >
            {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
