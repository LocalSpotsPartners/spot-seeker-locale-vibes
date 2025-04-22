import React from 'react';
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
import { Star, Share2, Mail, MessageSquare, whatsapp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PlaceCardProps {
  place: Place;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PlaceCard({ place, onMouseEnter, onMouseLeave }: PlaceCardProps) {
  const navigate = useNavigate();

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCardClick = () => {
    navigate(`/place/${place.id}`);
  };

  const handleShare = async (e: React.MouseEvent, method?: string) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/place/${place.id}`;
    const shareText = `Check out ${place.name}!`;
    
    if (method) {
      switch (method) {
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
          break;
        case 'sms':
          window.location.href = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        case 'whatsapp':
          window.location.href = `whatsapp://send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
      }
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    }
  };

  const placeFeaturesLimit = 3;
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
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
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg md:text-xl">{place.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navigator.share && (
                <DropdownMenuItem onClick={(e) => handleShare(e)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => handleShare(e, 'email')}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare(e, 'sms')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare(e, 'whatsapp')}>
                <whatsapp className="mr-2 h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-1">
          {place.neighborhood && (
            <p className="text-gray-600 text-sm md:text-base">{place.neighborhood}</p>
          )}
          <p className="text-gray-500 text-sm md:text-base">{place.location.address}</p>
        </div>
        
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
