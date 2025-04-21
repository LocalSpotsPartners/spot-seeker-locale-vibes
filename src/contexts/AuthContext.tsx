
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Updated type to include new properties
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;  // Added isLoading
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  // Added new properties for subscription and social login
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  subscription: {
    isPremium: boolean;
    isTrialActive: boolean;
    trialEndDate?: string;
  };
  activateTrial: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  // Added loading state

  // Initialize with default subscription state
  const [subscription, setSubscription] = useState({
    isPremium: false,
    isTrialActive: false,
    trialEndDate: undefined
  });

  useEffect(() => {
    // Initial check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session);
        
        if (session) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata.avatar_url,
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    checkSession();

    // Cleanup subscription
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (error) throw error;
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Placeholder implementations for subscription methods
  const activateTrial = async () => {
    // TODO: Implement actual trial activation logic
    setSubscription(prev => ({
      ...prev,
      isTrialActive: true,
      trialEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const upgradeToPremium = async () => {
    // TODO: Implement actual premium upgrade logic
    setSubscription(prev => ({
      ...prev,
      isPremium: true,
      isTrialActive: false
    }));
  };

  const cancelPremium = async () => {
    // TODO: Implement actual premium cancellation logic
    setSubscription(prev => ({
      ...prev,
      isPremium: false
    }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        login, 
        logout, 
        signup,
        socialLogin,
        subscription,
        activateTrial,
        upgradeToPremium,
        cancelPremium
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
