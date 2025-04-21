
import { Place } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaceCardProps {
  place: Place;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PlaceCard({ place, onMouseEnter, onMouseLeave }: PlaceCardProps) {
  const navigate = useNavigate();

  const handleImageClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    e.stopPropagation();
  };

  const handleCardClick = () => {
    navigate(`/place/${place.id}`);
  };

  const placeFeaturesLimit = 3;
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            {place.images && place.images.length > 0 ? (
              <img
                src={place.images[0]}
                alt={place.name}
                className="object-cover w-full h-full"
                onClick={handleImageClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </AspectRatio>
          <div className="absolute top-2 right-2 bg-white rounded-md px-2 py-1 shadow flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 text-lg md:text-xl">{place.name}</h3>
        <p className="text-gray-500 text-sm mb-3 md:text-base">{place.location.address}</p>
        
        <div className="flex flex-wrap gap-1">
          {place.features.slice(0, placeFeaturesLimit).map((feature) => (
            <Badge key={feature} variant="outline" className="capitalize">
              {feature}
            </Badge>
          ))}
          {place.features.length > placeFeaturesLimit && (
            <Badge variant="outline" className="bg-gray-50">
              +{place.features.length - placeFeaturesLimit}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/place/${place.id}`);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
