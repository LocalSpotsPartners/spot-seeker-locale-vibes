
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

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
    avatar: data.user.user_metadata.avatar_url || null,
  };

  return user;
};

// Signup function with metadata for name
export const signup = async (
  email: string, 
  password: string, 
  metadata?: { name: string; firstName: string; lastName: string }
): Promise<User> => {
  // First check if a user with this email already exists
  const { data: existingUsers, error: checkError } = await supabase
    .from('user_access')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking existing user:", checkError);
  } 

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Adding metadata for the user
      data: metadata,
      // Adding this explicit option to store the session
      emailRedirectTo: `${window.location.origin}/login`,
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user data returned");
  }

  // Fix: Create a properly typed user object with explicit null for avatar
  const user: User = {
    id: data.user.id,
    name: metadata?.name || data.user.email?.split('@')[0] || 'User',
    email: data.user.email || '',
    avatar: null, // Explicitly setting avatar to null to avoid type instantiation issues
  };

  // Log the successful signup for debugging
  console.log("User signed up successfully:", user.id);

  return user;
};

// Social login function
export const socialLogin = async (provider: 'google' | 'apple'): Promise<void> => {
  try {
    console.log(`Attempting to login with ${provider}...`);
    
    // Use correct redirect URL based on the current environment
    const redirectTo = `${window.location.origin}/login`;
    
    console.log(`Setting redirect URL to: ${redirectTo}`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error(`${provider} login error:`, error);
      throw new Error(error.message);
    }

    console.log(`${provider} login initiated:`, data);
    // The redirect will happen automatically
  } catch (err) {
    console.error(`Error during ${provider} login:`, err);
    toast.error(`Failed to login with ${provider}`);
    throw err;
  }
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
    avatar: user.user_metadata.avatar_url || null,
  };
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
