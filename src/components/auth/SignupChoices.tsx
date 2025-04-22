
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

  // Check for authenticated user on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, []);

  const startFreeTrial = async () => {
    try {
      setIsLoading({...isLoading, trial: true});
      
      // If we don't have userId yet, get it again
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        currentUserId = session?.user?.id;
        if (!currentUserId) {
          throw new Error("No user found. Please try logging in again.");
        }
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
        .from('user_access')
        .update({
          trial_end: tomorrow.toISOString(),
        })
        .eq('user_id', currentUserId);

      if (error) throw error;

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
      
      // Make sure we have a session before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session. Please log in again.");
      }
      
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
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
      setIsLoading({...isLoading, premium: false});
    }
  };

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
