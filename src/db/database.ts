
import Dexie, { type Table } from 'dexie';
import { Place, Review, User } from '../types';
import { samplePlaces, sampleReviews } from './sampleData';

// Create a Dexie database for client-side storage
class LocaleSpotDatabase extends Dexie {
  places!: Table<Place>;
  reviews!: Table<Review>;
  users!: Table<User>;
  
  constructor() {
    super('localeSpotDB');
    this.version(1).stores({
      places: 'id, name, *features',
      reviews: 'id, placeId, userId, rating',
      users: 'id, email'
    });
  }

  async initializeSampleData() {
    const placesCount = await this.places.count();
    const reviewsCount = await this.reviews.count();
    
    if (placesCount === 0) {
      // Only seed places if database is empty
      await this.places.bulkAdd(samplePlaces);
    }
    
    if (reviewsCount === 0) {
      // Only seed reviews if database is empty
      await this.reviews.bulkAdd(sampleReviews);
    }
  }
}

export const db = new LocaleSpotDatabase();

// Initialize the database with sample data
export const initDB = async () => {
  await db.initializeSampleData();
};
