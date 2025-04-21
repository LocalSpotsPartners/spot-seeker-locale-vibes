
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { Button } from "@/components/ui/button";
import { db } from "@/db/database";
import { ArrowLeft } from "lucide-react";
import { sampleReviews } from "@/db/sampleData";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
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
        // Load the place details
        const placeData = await db.places.get(id);
        
        if (!placeData) {
          setError("Place not found");
          setIsLoading(false);
          return;
        }
        
        setPlace(placeData);
        
        // Try to load reviews from database first
        const placeReviews = await db.reviews
          .where("placeId")
          .equals(id)
          .reverse()
          .sortBy("date");
        
        // If no reviews in database for this place, use sample reviews
        if (placeReviews.length === 0) {
          const filteredSampleReviews = sampleReviews.filter(review => review.placeId === id);
          setReviews(filteredSampleReviews);
          
          // Also add sample reviews to database for future use
          if (filteredSampleReviews.length > 0) {
            await db.reviews.bulkAdd(filteredSampleReviews);
          }
        } else {
          setReviews(placeReviews);
        }
      } catch (error) {
        console.error("Failed to load place details:", error);
        setError("Failed to load place details");
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
        
        <PlaceDetail place={place} reviews={reviews} />
      </div>
    </Layout>
  );
}
