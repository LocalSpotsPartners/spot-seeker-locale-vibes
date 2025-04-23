
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignupChoices } from "@/components/auth/SignupChoices";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showVerification, setShowVerification] = useState(false);
  
  // Check if we have a verification code in the URL
  useEffect(() => {
    // This parameter will be present if this page is loaded as a result of clicking a verification link
    const type = searchParams.get('type');
    if (type === 'signup' || type === 'recovery' || type === 'invite') {
      setShowVerification(true);
      // Try to auto-verify if possible
      // Supabase will handle this automatically if the other required params are present
      toast.success("Verifying your email...");
    }
  }, [searchParams]);
  
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

  // If we're showing the verification success message
  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-locale-500 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Locale Spots</h2>
            <p className="mt-1">Choose Your Plan</p>
          </div>
          <div className="p-6">
            <SignupChoices />
          </div>
        </div>
      </div>
    );
  }
  
  return <AuthScreen />;
}
