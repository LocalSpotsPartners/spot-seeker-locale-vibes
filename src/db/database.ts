
import { supabase } from '@/integrations/supabase/client';
import { Place, Review } from '../types';
import { samplePlaces, sampleReviews } from './sampleData';

// Create a Dexie database for client-side storage
class LocaleSpotDatabase {
  async initializeSampleData() {
    const { data: places } = await supabase.from('places').select('*');
    if (!places || places.length === 0) {
      // If no places in Supabase, initialize with sample data
      await supabase.from('places').insert(samplePlaces);
    }

    const { data: reviews } = await supabase.from('reviews').select('*');
    if (!reviews || reviews.length === 0) {
      // If no reviews in Supabase, initialize with sample data
      await supabase.from('reviews').insert(sampleReviews);
    }
  }
}

export const db = new LocaleSpotDatabase();

// Initialize the database with sample data if needed
export const initDB = async () => {
  await db.initializeSampleData();
};
