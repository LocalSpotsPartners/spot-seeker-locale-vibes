
import { Place } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface HighlightedPlaceProps {
  place: Place;
}

export function HighlightedPlace({ place }: HighlightedPlaceProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="w-[280px] bg-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => navigate(`/place/${place.id}`)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{place.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm ml-1">{place.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{place.location.address}</p>
        <div className="flex flex-wrap gap-1">
          {place.features.slice(0, 3).map(feature => (
            <span 
              key={feature}
              className="bg-gray-100 text-gray-800 text-[10px] py-0.5 px-2 rounded-full"
            >
              {feature}
            </span>
          ))}
          {place.features.length > 3 && (
            <span className="bg-gray-100 text-gray-800 text-[10px] py-0.5 px-2 rounded-full">
              +{place.features.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
