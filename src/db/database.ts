
import Dexie, { type Table } from 'dexie';
import { Place, Review, User } from '../types';
import { samplePlaces } from './sampleData';

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
    
    if (placesCount === 0) {
      // Only seed if database is empty
      await this.places.bulkAdd(samplePlaces);
    }
  }
}

export const db = new LocaleSpotDatabase();

// Initialize the database with sample data
export const initDB = async () => {
  await db.initializeSampleData();
};
