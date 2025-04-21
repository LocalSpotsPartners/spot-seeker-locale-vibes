import { useCallback, useState } from "react";
import { Place, Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewList } from "../reviews/ReviewList";
import { ReviewForm } from "../reviews/ReviewForm";
import { MapPin, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface PlaceDetailProps {
  place: Place;
  reviews: Review[];
}

export function PlaceDetail({ place, reviews: initialReviews }: PlaceDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  
  const handleAddReview = useCallback(async (review: Omit<Review, "id" | "userId" | "userName" | "userAvatar" | "date">) => {
    if (!user) return;
    
    const newReview = {
      place_id: place.id,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatar,
      rating: review.rating,
      comment: review.comment
    };
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const addedReview: Review = {
          id: data[0].id,
          placeId: data[0].place_id || '',
          userId: data[0].user_id || '',
          userName: data[0].user_name,
          userAvatar: data[0].user_avatar,
          rating: data[0].rating || 0,
          comment: data[0].comment || '',
          date: data[0].created_at || new Date().toISOString()
        };
        
        setLocalReviews(prev => [addedReview, ...prev]);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  }, [user, place.id]);
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <AspectRatio ratio={21/9}>
          <img
            src={place.images[0] || "/placeholder.svg"}
            alt={place.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{place.name}</h1>
            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{place.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-1 mb-4">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">{place.location.address}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {place.features.map((feature) => (
              <Badge key={feature} variant="secondary">
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
              </Badge>
            ))}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({localReviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="pt-4">
              <p className="text-gray-700 whitespace-pre-line">{place.description}</p>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-4">
                {isAuthenticated && (
                  <div>
                    {!showForm ? (
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="w-full"
                      >
                        Write a Review
                      </Button>
                    ) : (
                      <ReviewForm 
                        placeId={place.id}
                        onAddReview={handleAddReview}
                        onCancel={() => setShowForm(false)}
                      />
                    )}
                  </div>
                )}
                
                <ReviewList reviews={localReviews} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
