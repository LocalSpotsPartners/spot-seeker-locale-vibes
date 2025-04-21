
import { useState } from "react";
import { PlaceFeature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [open, setOpen] = useState(false);

  const handleFeatureToggle = (feature: PlaceFeature, checked: boolean) => {
    if (checked) {
      onFilterChange([...selectedFeatures, feature]);
    } else {
      onFilterChange(selectedFeatures.filter(f => f !== feature));
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-5 w-5" />
        <h3 className="font-medium">Filter by features</h3>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start font-normal text-left">
            {selectedFeatures.length > 0 
              ? `Selected Filters (${selectedFeatures.length})` 
              : "Select features..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-4" align="start">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {availableFeatures.map(feature => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`feature-${feature}`}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={(checked) => 
                      handleFeatureToggle(feature, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`feature-${feature}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </label>
                </div>
              ))}
            </div>
            {selectedFeatures.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="mt-2 w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedFeatures.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-start mt-3">
          {selectedFeatures.map(feature => (
            <Badge 
              key={feature}
              variant="outline"
              className="cursor-pointer bg-locale-100 text-locale-800 border-locale-800"
              onClick={() => handleFeatureToggle(feature, false)}
            >
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
