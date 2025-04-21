
import { Place, Review } from '../types';

// Sample places data
export const samplePlaces: Place[] = [
  {
    id: '1',
    name: 'Skyview Rooftop Lounge',
    description: 'A spectacular rooftop lounge offering panoramic city views, craft cocktails, and a relaxed atmosphere perfect for sunset drinks.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['rooftop', 'bar', 'view'],
    location: {
      lat: 40.712776,
      lng: -74.005974,
      address: '123 Skyline Avenue, New York, NY'
    },
    rating: 4.7
  },
  {
    id: '2',
    name: 'Green Garden Café',
    description: 'Charming café with outdoor seating surrounded by lush plants. Known for organic coffee and fresh-baked pastries.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['outdoor', 'coffee', 'wifi'],
    location: {
      lat: 40.715120,
      lng: -74.002860,
      address: '45 Garden Street, New York, NY'
    },
    rating: 4.5
  },
  {
    id: '3',
    name: 'The Hidden Bistro',
    description: 'A cozy, tucked-away restaurant serving creative small plates and an extensive wine selection in an intimate setting.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['restaurant', 'quiet'],
    location: {
      lat: 40.718842,
      lng: -73.997330,
      address: '78 Secret Lane, New York, NY'
    },
    rating: 4.8
  },
  {
    id: '4',
    name: 'Waterside Deck',
    description: 'Spectacular waterfront venue with outdoor seating, amazing sunset views, and a menu focusing on fresh seafood.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['outdoor', 'restaurant', 'view'],
    location: {
      lat: 40.708842,
      lng: -73.996235,
      address: '250 Harbor Drive, New York, NY'
    },
    rating: 4.6
  },
  {
    id: '5',
    name: 'Digital Nomad Hub',
    description: 'Modern workspace café with high-speed wifi, plenty of outlets, and an excellent selection of coffee and light meals.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['wifi', 'coffee', 'quiet'],
    location: {
      lat: 40.722842,
      lng: -73.990330,
      address: '189 Tech Street, New York, NY'
    },
    rating: 4.4
  },
  {
    id: '6',
    name: 'Sunset Rooftop Bar',
    description: 'Trendy rooftop bar with craft cocktails, DJ nights on weekends, and breathtaking views of the city skyline.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    features: ['rooftop', 'bar', 'view'],
    location: {
      lat: 40.720145,
      lng: -73.988976,
      address: '567 Skyline Boulevard, New York, NY'
    },
    rating: 4.9
  }
];

// Sample reviews data
export const sampleReviews: Review[] = [
  {
    id: '101',
    placeId: '1',
    userId: '1',
    userName: 'Alex Johnson',
    userAvatar: '/placeholder.svg',
    rating: 5,
    comment: 'The view is absolutely spectacular! Great drinks and atmosphere.',
    date: '2023-09-15'
  },
  {
    id: '102',
    placeId: '1',
    userId: '2',
    userName: 'Sam Taylor',
    userAvatar: '/placeholder.svg',
    rating: 4,
    comment: 'Enjoyed the sunset views, but it gets crowded on weekends.',
    date: '2023-09-10'
  },
  {
    id: '103',
    placeId: '2',
    userId: '3',
    userName: 'Jamie Smith',
    userAvatar: '/placeholder.svg',
    rating: 5,
    comment: 'Perfect spot for working remotely. Great coffee and peaceful atmosphere!',
    date: '2023-09-12'
  }
];

// Sample users data (for authentication demo)
export const sampleUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    avatar: '/placeholder.svg'
  }
];
