
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function SignupChoices() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    trial: false,
    premium: false
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionCheckComplete, setIsSessionCheckComplete] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(true);

  // Check for authenticated user on component mount and whenever the component is shown
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking for auth session in SignupChoices...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          console.log("User authenticated in SignupChoices:", session.user.id);
          
          // Check if email is confirmed
          const emailConfirmed = session.user.email_confirmed_at || session.user.confirmed_at;
          if (!emailConfirmed) {
            console.log("Email not confirmed for user:", session.user.email);
            setShowVerificationMessage(true);
          } else {
            console.log("Email confirmed for user:", session.user.email);
            setShowVerificationMessage(false);
            setUserId(session.user.id);
          }
        } else {
          console.log("No active session found in SignupChoices");
          setShowVerificationMessage(true);
        }
        setIsSessionCheckComplete(true);
      } catch (error) {
        console.error("Error checking auth in SignupChoices:", error);
        setIsSessionCheckComplete(true);
      }
    };
    
    checkAuth();
    
    // Also listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in SignupChoices:", event, session?.user?.id);
      if (session?.user?.id) {
        // Check if email is confirmed on auth state change
        const emailConfirmed = session.user.email_confirmed_at || session.user.confirmed_at;
        if (emailConfirmed) {
          setShowVerificationMessage(false);
          setUserId(session.user.id);
        } else {
          setShowVerificationMessage(true);
          setUserId(null);
        }
      } else {
        setUserId(null);
        setShowVerificationMessage(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startFreeTrial = async () => {
    try {
      setIsLoading({...isLoading, trial: true});
      
      // Check if we have a userId from state
      if (!userId) {
        // Try to get the current session again
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          console.error("No authenticated user found for free trial");
          throw new Error("You need to be logged in to start the free trial. Please log in and try again.");
        }
        
        setUserId(session.user.id);
      }

      console.log("Starting free trial for user:", userId);
      
      // Create tomorrow's date for trial end
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if the user already exists in user_access
      const { data: existingAccess, error: checkError } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking user access:", checkError);
        throw new Error("Error checking user access");
      }
      
      let updateError;
      
      if (existingAccess) {
        // Update existing record
        const { error } = await supabase
          .from('user_access')
          .update({
            trial_end: tomorrow.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_access')
          .insert({
            user_id: userId,
            trial_end: tomorrow.toISOString(),
          });
        
        updateError = error;
      }

      if (updateError) {
        console.error("Error updating user_access:", updateError);
        throw updateError;
      }

      toast.success("Free trial activated!");
      navigate('/');
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error(error instanceof Error ? error.message : "Failed to start trial");
    } finally {
      setIsLoading({...isLoading, trial: false});
    }
  };

  const startPremium = async () => {
    try {
      setIsLoading({...isLoading, premium: true});
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session for premium upgrade");
        throw new Error("No active session. Please log in again.");
      }
      
      console.log("Creating payment for user:", session.user.id);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }
      
      if (!data || !data.url) {
        console.error('No URL returned from payment function:', data);
        throw new Error('Failed to generate payment URL');
      }
      
      console.log("Payment URL generated, redirecting to:", data.url);
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
      setIsLoading({...isLoading, premium: false});
    }
  };

  // Show loading state until session check is complete
  if (!isSessionCheckComplete) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-locale-500"></div>
      </div>
    );
  }

  // Show verification message if email is not verified
  if (showVerificationMessage) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-100 text-blue-700 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-4">Email Verification Required</h2>
          <p className="mb-2">Please check your email inbox and verify your account before continuing.</p>
          <p className="text-sm">Didn't receive the verification email? Check your spam folder or try signing up again.</p>
          
          <Button 
            onClick={() => navigate('/login')}
            className="mt-4"
            variant="outline"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Free Trial</h3>
          </div>
          <p className="text-gray-600">Try all features free for 24 hours</p>
          <Button 
            onClick={startFreeTrial} 
            className="w-full" 
            variant="outline"
            disabled={isLoading.trial}
          >
            {isLoading.trial ? 'Starting...' : 'Start Free Trial'}
          </Button>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow border-blue-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold">Premium</h3>
          </div>
          <p className="text-gray-600">Get unlimited access for just €5</p>
          <Button 
            onClick={startPremium} 
            className="w-full"
            disabled={isLoading.premium}
          >
            {isLoading.premium ? 'Processing...' : 'Go Premium'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
