import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { login as authLogin, logout as authLogout, signup as authSignup, socialLogin as authSocialLogin } from "@/lib/auth";

type Subscription = {
  isPremium: boolean;
  isTrialActive: boolean;
  trialEndDate: string | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: Subscription;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  activateTrial: () => void;
  upgradeToPremium: () => void;
  cancelPremium: () => void;
};

const DEFAULT_SUBSCRIPTION: Subscription = {
  isPremium: false,
  isTrialActive: false,
  trialEndDate: null,
};

const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get subscription data from localStorage
const getStoredSubscription = (userId: string): Subscription => {
  try {
    const storedData = localStorage.getItem(`subscription-${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to get subscription data from storage:", error);
  }
  return DEFAULT_SUBSCRIPTION;
};

// Helper function to save subscription data to localStorage
const saveSubscription = (userId: string, subscription: Subscription): void => {
  try {
    localStorage.setItem(`subscription-${userId}`, JSON.stringify(subscription));
  } catch (error) {
    console.error("Failed to save subscription data to storage:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
        };
        setUser(user);
        
        // Load subscription data
        if (user.id) {
          const storedSubscription = getStoredSubscription(user.id);
          setSubscription(storedSubscription);
        }
      } else {
        setUser(null);
        setSubscription(DEFAULT_SUBSCRIPTION);
      }
      setIsLoading(false);
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
        };
        setUser(user);
        
        if (user.id) {
          const storedSubscription = getStoredSubscription(user.id);
          setSubscription(storedSubscription);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await authLogin(email, password);
      setUser(user);
      
      // Load subscription data
      const storedSubscription = getStoredSubscription(user.id);
      setSubscription(storedSubscription);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await authSignup(name, email, password);
      setUser(user);
      
      // New users don't have a subscription yet
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true);
      const user = await authSocialLogin(provider);
      setUser(user);
      
      // Load subscription data
      const storedSubscription = getStoredSubscription(user.id);
      setSubscription(storedSubscription);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authLogout();
      setUser(null);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  const activateTrial = () => {
    if (!user) return;
    
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + TRIAL_DURATION_MS);
    
    const updatedSubscription: Subscription = {
      isPremium: false,
      isTrialActive: true,
      trialEndDate: trialEndDate.toISOString(),
    };
    
    setSubscription(updatedSubscription);
    saveSubscription(user.id, updatedSubscription);
  };

  const upgradeToPremium = () => {
    if (!user) return;
    
    const updatedSubscription: Subscription = {
      isPremium: true,
      isTrialActive: false,
      trialEndDate: null,
    };
    
    setSubscription(updatedSubscription);
    saveSubscription(user.id, updatedSubscription);
  };

  const cancelPremium = () => {
    if (!user) return;
    
    const updatedSubscription: Subscription = {
      isPremium: false,
      isTrialActive: false,
      trialEndDate: null,
    };
    
    setSubscription(updatedSubscription);
    saveSubscription(user.id, updatedSubscription);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    subscription,
    login,
    signup,
    socialLogin,
    logout,
    activateTrial,
    upgradeToPremium,
    cancelPremium
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
