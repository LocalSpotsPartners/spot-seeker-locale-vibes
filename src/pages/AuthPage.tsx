
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
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // If we have a session from the OAuth redirect, show success message
        if (data.session && window.location.hash) {
          console.log("OAuth callback successful, navigating to home");
          toast.success("Successfully logged in!");
          // Force navigation to home page immediately
          navigate("/", { replace: true });
        } else if (error) {
          console.error("OAuth callback error:", error);
          toast.error(`Authentication error: ${error.message}`);
        }
      } catch (err) {
        console.error("Unexpected error during OAuth callback:", err);
        toast.error("An unexpected error occurred during login");
      }
    };
    
    handleOAuthCallback();
  }, [navigate]);
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("User is authenticated, redirecting to home");
      navigate("/", { replace: true });
    } else {
      console.log("Auth status:", { isAuthenticated, isLoading });
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
