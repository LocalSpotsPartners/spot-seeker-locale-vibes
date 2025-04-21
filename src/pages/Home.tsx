
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { FeatureFilter } from "@/components/places/FeatureFilter";
import { PlaceFeature } from "@/types";
import { db } from "@/db/database";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState<PlaceFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load places from the database
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const allPlaces = await db.places.toArray();
        setPlaces(allPlaces);
      } catch (error) {
        console.error("Failed to load places:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaces();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Local Spots</h1>
          <p className="text-gray-600">
            Explore our curated collection of local gems and hidden favorites
          </p>
        </div>
        
        <FeatureFilter onFilterChange={setSelectedFeatures} />
        
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading places...</p>
          </div>
        ) : (
          <PlaceGrid places={places} selectedFeatures={selectedFeatures} />
        )}
      </div>
    </Layout>
  );
}
