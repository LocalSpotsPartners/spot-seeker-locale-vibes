
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: { name: string; firstName: string; lastName: string }) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const [subscription, setSubscription] = useState({
    isPremium: false,
    isTrialActive: false,
    trialEndDate: undefined
  });

  useEffect(() => {
    setIsLoading(true);

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (session) {
        const emailConfirmed = session.user.email_confirmed_at || session.user.confirmed_at;
        if (!emailConfirmed) {
          console.log("Email not confirmed for user:", session.user.email);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          // Only show error if not right after signup
          if (event !== 'SIGNED_UP' as AuthChangeEvent) {
            toast.error("Please confirm your email before logging in.");
            supabase.auth.signOut();
          }
          return;
        }
        
        console.log("Email confirmed for user:", session.user.email);
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
          firstName: session.user.user_metadata.firstName,
          lastName: session.user.user_metadata.lastName
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const emailConfirmed = session.user.email_confirmed_at || session.user.confirmed_at;
          if (!emailConfirmed) {
            console.log("Email not confirmed during session check:", session.user.email);
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          console.log("Session check: Email confirmed for user:", session.user.email);
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata.avatar_url,
            firstName: session.user.user_metadata.firstName,
            lastName: session.user.user_metadata.lastName
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const emailConfirmed = data.user.email_confirmed_at || data.user.confirmed_at;
      if (!emailConfirmed) {
        toast.error("Please confirm your email before logging in.");
        await supabase.auth.signOut();
        throw new Error("Email not confirmed. Please check your inbox.");
      }
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    metadata?: { name: string; firstName: string; lastName: string }
  ) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login?type=signup`,
      }
    });
    if (error) throw error;
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const activateTrial = async () => {
    setSubscription(prev => ({
      ...prev,
      isTrialActive: true,
      trialEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const upgradeToPremium = async () => {
    setSubscription(prev => ({
      ...prev,
      isPremium: true,
      isTrialActive: false
    }));
  };

  const cancelPremium = async () => {
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
