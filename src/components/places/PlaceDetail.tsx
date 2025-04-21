
import { useCallback, useState } from "react";
import { Place, Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewList } from "../reviews/ReviewList";
import { MapPin, Star } from "lucide-react";
import { ReviewForm } from "../reviews/ReviewForm";
import { db } from "@/db/database";
import { useAuth } from "@/contexts/AuthContext";

interface PlaceDetailProps {
  place: Place;
  reviews: Review[];
}

export function PlaceDetail({ place, reviews }: PlaceDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [showForm, setShowForm] = useState(false);
  
  const handleAddReview = useCallback(async (review: Omit<Review, "id" | "userId" | "userName" | "userAvatar" | "date">) => {
    if (!user) return;
    
    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 15),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      date: new Date().toISOString().split('T')[0],
      ...review
    };
    
    try {
      // Save to IndexedDB
      await db.reviews.add(newReview);
      
      // Update the local state
      setLocalReviews(prev => [newReview, ...prev]);
      setShowForm(false);
      
      // Update the place rating (average of all reviews)
      const allReviews = [...localReviews, newReview];
      const averageRating = allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length;
      
      await db.places.update(place.id, {
        rating: parseFloat(averageRating.toFixed(1))
      });
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  }, [user, localReviews, place.id]);
  
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
