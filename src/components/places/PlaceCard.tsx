
import { Place } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const [isWished, setIsWished] = useState(false);

  // Check wish list status on mount
  useEffect(() => {
    const stored = localStorage.getItem("wishList");
    if (stored) {
      const places = JSON.parse(stored) as Place[];
      setIsWished(places.some((p) => p.id === place.id));
    }
  }, [place.id]);

  // Toggle wish list
  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigating to details
    const stored = localStorage.getItem("wishList");
    let places: Place[] = [];
    if (stored) places = JSON.parse(stored) as Place[];

    if (isWished) {
      // Remove from wish list
      const updated = places.filter((p) => p.id !== place.id);
      localStorage.setItem("wishList", JSON.stringify(updated));
      setIsWished(false);
    } else {
      // Add to wish list
      if (!places.some((p) => p.id === place.id)) {
        localStorage.setItem("wishList", JSON.stringify([...places, place]));
        setIsWished(true);
      }
    }
  };

  return (
    <Card className="transition hover:shadow-lg relative group">
      <Link to={`/place/${place.id}`} className="block">
        {place.images && place.images.length > 0 ? (
          <div className="relative h-40">
            <Carousel className="w-full h-40">
              <CarouselContent>
                {place.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image}
                      alt={`${place.name} - Image ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {place.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
        ) : (
          <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-300">📍</span>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">{place.name}</h2>
            <button
              onClick={handleWish}
              title={isWished ? "Remove from Wish List" : "Add to Wish List"}
              className="p-1 rounded-full hover:bg-locale-100 transition group"
              aria-pressed={isWished}
              aria-label="Toggle Wish List"
            >
              <Heart
                size={20}
                className={`transition ${isWished ? "fill-locale-500 text-locale-500" : "text-gray-300 group-hover:text-locale-500"}`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {place.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline">
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
              </Badge>
            ))}
            {place.features.length > 3 && (
              <Badge variant="outline" className="opacity-50">
                +{place.features.length - 3}
              </Badge>
            )}
          </div>

          <div className="text-xs text-gray-500 mb-2">{place.location.address}</div>
          <div>
            <span className="mr-1 text-yellow-500">★</span>
            <span className="font-medium">{place.rating.toFixed(1)}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
