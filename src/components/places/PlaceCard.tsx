
import { useState } from "react";
import { Link } from "react-router-dom";
import { Place } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
      <Link to={`/place/${place.id}`}>
        <AspectRatio ratio={16 / 9}>
          <img
            src={imageError ? "/placeholder.svg" : (place.images[0] || "/placeholder.svg")}
            alt={place.name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        </AspectRatio>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg line-clamp-1">{place.name}</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500 line-clamp-1">{place.location.address}</p>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 pt-0 flex gap-2 flex-wrap">
          {place.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </Badge>
          ))}
        </CardFooter>
      </Link>
    </Card>
  );
}
