
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, login as authLogin, logout as authLogout, signup as authSignup } from "@/lib/auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const loadUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await authLogin(email, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await authSignup(name, email, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout
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
