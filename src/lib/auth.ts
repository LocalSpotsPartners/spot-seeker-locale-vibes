
import { User } from "@/types";

// Mock authentication service
// In a real app, you'd use a proper auth service like Firebase, Auth0, or Clerk

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

// Local storage keys
const USER_STORAGE_KEY = "locale-spots-user";

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
};

// Load user from storage on init
const loadUserFromStorage = (): AuthState => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      return { user, isAuthenticated: true };
    }
  } catch (error) {
    console.error("Failed to load user from storage:", error);
  }
  return initialAuthState;
};

// Save user to storage
const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save user to storage:", error);
  }
};

// Mock login function - would be replaced with a real auth implementation
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Demo login - in a real app you'd validate against your auth service
  if (email === "demo@example.com" && password === "password123") {
    const user: User = {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
      avatar: "/placeholder.svg",
    };
    saveUserToStorage(user);
    return user;
  }
  
  throw new Error("Invalid email or password");
};

// Mock signup function
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // In a real app, you would create a new user in your auth service
  const user: User = {
    id: Math.random().toString(36).slice(2, 11), // Generate random ID
    name,
    email,
    avatar: "/placeholder.svg",
  };
  
  saveUserToStorage(user);
  return user;
};

// Logout function
export const logout = async (): Promise<void> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  saveUserToStorage(null);
};

// Get current user
export const getCurrentUser = (): User | null => {
  const authState = loadUserFromStorage();
  return authState.user;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authState = loadUserFromStorage();
  return authState.isAuthenticated;
};
