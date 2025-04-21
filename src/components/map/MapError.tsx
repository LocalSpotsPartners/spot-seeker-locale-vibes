
import { Place } from '@/types';

interface MapErrorProps {
  places: Place[];
}

export function MapError({ places }: MapErrorProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100 flex-col">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Map View</h2>
        <p className="mb-4">
          Unable to load the map. Please make sure the Mapbox token is correctly configured in Supabase.
        </p>
        <div className="text-sm text-gray-500">
          This is a placeholder until a valid Mapbox token is provided.
        </div>
        
        <div className="mt-6">
          <div className="text-left mb-4">
            <h3 className="font-medium mb-2">Places that would appear on the map:</h3>
            <ul className="text-sm list-disc list-inside">
              {places.map(place => (
                <li key={place.id} className="mb-1">{place.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
