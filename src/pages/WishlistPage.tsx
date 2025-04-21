
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PlaceGrid } from "@/components/places/PlaceGrid";
import { PlaceFeature, Place } from "@/types";

export default function WishlistPage() {
  const [wishList, setWishList] = useState<Place[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("wishList");
    if (stored) {
      setWishList(JSON.parse(stored));
    }
  }, []);

  return (
    <Layout>
      <div className="container py-8 pb-20">
        <h1 className="text-2xl font-bold mb-4">My Wish List</h1>
        {wishList.length === 0 ? (
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
