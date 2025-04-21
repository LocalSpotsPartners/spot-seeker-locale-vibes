// Define types used throughout the application
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'google' | 'apple';
};

export type PlaceFeature = 
  | "rooftop" 
  | "outdoor" 
  | "coffee" 
  | "wifi" 
  | "bar" 
  | "restaurant" 
  | "quiet"
  | "view";

export type Location = {
  lat: number;
  lng: number;
  address: string;
};

export type Place = {
  id: string;
  name: string;
  description: string;
  images: string[];
  features: PlaceFeature[];
  location: Location;
  rating: number;
  neighborhood?: string;
  coordinates?: [number, number];
};

export type Review = {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
};
