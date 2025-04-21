
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Local storage keys
const USER_STORAGE_KEY = "locale-spots-user";

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user data returned");
  }

  const user: User = {
    id: data.user.id,
    name: data.user.user_metadata.name || data.user.email?.split('@')[0] || 'User',
    email: data.user.email || '',
    avatar: data.user.user_metadata.avatar_url,
  };

  return user;
};

// Signup function
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user data returned");
  }

  const user: User = {
    id: data.user.id,
    name: name,
    email: data.user.email || '',
    avatar: data.user.user_metadata.avatar_url,
  };

  return user;
};

// Social login function
export const socialLogin = async (provider: 'google' | 'apple'): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Note: The actual user data will be handled by the auth state change listener
  // This is because OAuth redirects the user and we get the data on return
  return {} as User;
};

// Logout function
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return {
    id: user.id,
    name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata.avatar_url,
  };
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
