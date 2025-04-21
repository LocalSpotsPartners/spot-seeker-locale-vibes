
import { useMemo } from "react";
import { PlaceFeature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-5 w-5" />
        <h3 className="font-medium">Filter by features</h3>
      </div>
      
      <Select
        onValueChange={(value: PlaceFeature) => handleFeatureToggle(value)}
      >
        <SelectTrigger className="w-full mb-3">
          <SelectValue placeholder="Select features..." />
        </SelectTrigger>
        <SelectContent>
          {availableFeatures.map(feature => (
            <SelectItem 
              key={feature} 
              value={feature}
              className="cursor-pointer"
            >
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedFeatures.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-start">
          {selectedFeatures.map(feature => (
            <Badge 
              key={feature}
              variant="outline"
              className="cursor-pointer bg-locale-100 text-locale-800 border-locale-800"
              onClick={() => handleFeatureToggle(feature)}
            >
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
