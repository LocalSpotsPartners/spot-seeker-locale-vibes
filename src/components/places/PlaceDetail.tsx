
import { useCallback, useState, useEffect } from "react";
import { Place, Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewList } from "../reviews/ReviewList";
import { ReviewForm } from "../reviews/ReviewForm";
import { MapPin, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlaceDetailProps {
  place: Place;
  reviews: Review[];
}

export function PlaceDetail({ place, reviews: initialReviews }: PlaceDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddReview = useCallback(async (review: Omit<Review, "id" | "userId" | "userName" | "userAvatar" | "date">) => {
    if (!user) {
      toast.error("You must be logged in to submit a review");
      return;
    }
    
    setIsSubmitting(true);
    
    const newReview = {
      place_id: place.id,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatar || '',
      rating: review.rating,
      comment: review.comment
    };
    
    try {
      console.log("Submitting review to Supabase:", newReview);
      
      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Supabase response:", data);
      
      if (data && data.length > 0) {
        // Transform the response into a Review object
        const addedReview: Review = {
          id: data[0].id,
          placeId: data[0].place_id || '',
          userId: data[0].user_id || '',
          userName: data[0].user_name,
          userAvatar: data[0].user_avatar || '',
          rating: data[0].rating || 0,
          comment: data[0].comment || '',
          date: data[0].created_at || new Date().toISOString()
        };
        
        console.log("Transformed review:", addedReview);
        
        // Add the new review to the beginning of localReviews
        setLocalReviews(prev => [addedReview, ...prev]);
        setShowForm(false);
        toast.success("Review submitted successfully");
      } else {
        toast.error("No data returned from Supabase");
      }
    } catch (error) {
      console.error("Failed to add review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add review");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, place.id]);
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {place.images && place.images.length > 0 ? (
          <div className="relative">
            <Carousel>
              <CarouselContent>
                {place.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[21/9]">
                      <img
                        src={image}
                        alt={`${place.name} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {place.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </div>
        ) : (
          <div className="aspect-[21/9] bg-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-300">📍</span>
          </div>
        )}
        
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
                {isAuthenticated ? (
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
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    Please log in to write a review
                  </p>
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
