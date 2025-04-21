
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Handle OAuth callback
  useEffect(() => {
    // Check if this is a redirect from OAuth
    const handleOAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // If we have a session from the OAuth redirect, show success message
      if (data.session && window.location.hash) {
        toast.success("Successfully logged in!");
      } else if (error) {
        console.error("OAuth callback error:", error);
        toast.error(`Authentication error: ${error.message}`);
      }
    };
    
    handleOAuthCallback();
  }, []);
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-locale-500"></div>
      </div>
    );
  }
  
  return <AuthScreen />;
}
