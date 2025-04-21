import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Place, Review, PlaceFeature } from "@/types";
import { MapView } from "@/components/map/MapView";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaceAndReviews = async () => {
      if (!id) {
        setError("Place ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const { data: placeData, error: placeError } = await supabase
          .from('places')
          .select('*')
          .eq('id', id)
          .single();
        
        if (placeError) throw placeError;
        if (!placeData) throw new Error('Place not found');
        
        const transformedPlace: Place = {
          id: placeData.id,
          name: placeData.name,
          description: placeData.description || '',
          images: placeData.images || [],
          features: (placeData.features || []).filter((feature): feature is PlaceFeature => 
            ['rooftop', 'outdoor', 'coffee', 'wifi', 'bar', 'restaurant', 'quiet', 'view'].includes(feature)
          ),
          rating: placeData.rating || 0,
          location: {
            lat: Number(placeData.lat) || 0,
            lng: Number(placeData.lng) || 0,
            address: placeData.address || ''
          }
        };
        
        setPlace(transformedPlace);
        
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('place_id', id)
          .order('created_at', { ascending: false });
        
        if (reviewsError) throw reviewsError;
        
        if (reviewsData) {
          const transformedReviews: Review[] = reviewsData.map(review => ({
            id: review.id,
            placeId: review.place_id || '',
            userId: review.user_id || '',
            userName: review.user_name,
            userAvatar: review.user_avatar || '',
            rating: review.rating || 0,
            comment: review.comment || '',
            date: review.created_at || new Date().toISOString()
          }));
          
          setReviews(transformedReviews);
        }
      } catch (error) {
        console.error("Failed to load place details:", error);
        setError(error instanceof Error ? error.message : "Failed to load place details");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaceAndReviews();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
          <p className="ml-3 text-gray-600">Loading place details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !place) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error || "Failed to load place"}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          size="sm"
          className="mb-4 flex items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="space-y-8">
          <PlaceDetail place={place} reviews={reviews} />
          
          <div className="h-[400px] rounded-lg overflow-hidden shadow-lg">
            <MapView 
              places={[place]} 
              selectedFeatures={[]} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
