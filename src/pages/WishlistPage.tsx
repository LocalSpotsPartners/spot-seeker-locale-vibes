
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { PlaceFeature, Place } from "@/types";
import { toast } from "sonner";

export default function WishlistPage() {
  const [wishList, setWishList] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    const stored = localStorage.getItem("wishList");
    if (stored) {
      try {
        const parsedList = JSON.parse(stored);
        
        // Remove duplicates by using a Map with place IDs as keys
        const uniqueMap = new Map<string, Place>();
        parsedList.forEach((place: Place) => {
          uniqueMap.set(place.id, place);
        });
        
        const uniqueList = Array.from(uniqueMap.values());
        
        // If we removed duplicates, update localStorage
        if (uniqueList.length !== parsedList.length) {
          localStorage.setItem("wishList", JSON.stringify(uniqueList));
          toast.info(`Removed ${parsedList.length - uniqueList.length} duplicate items`);
        }
        
        setWishList(uniqueList);
      } catch (error) {
        console.error("Failed to parse wishlist:", error);
        toast.error("Failed to load wishlist");
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <Layout>
      <div className="container py-8 pb-20">
        <h1 className="text-2xl font-bold mb-4">My Wish List</h1>
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-locale-500 border-r-transparent"></div>
          </div>
        ) : wishList.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No places added to your wish list yet.
          </div>
        ) : (
          <PlaceGrid places={wishList} selectedFeatures={[]} />
        )}
      </div>
    </Layout>
  );
}
