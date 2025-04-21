
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapControlsProps {
  onLocationClick: () => void;
  placesCount: number;
}

export function MapControls({ onLocationClick, placesCount }: MapControlsProps) {
  return (
    <>
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={onLocationClick}
        >
          <MapPin className="h-4 w-4 mr-1" />
          My Location
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white p-2 rounded shadow text-xs">
          {placesCount} locations on map
        </div>
      </div>
    </>
  );
}
