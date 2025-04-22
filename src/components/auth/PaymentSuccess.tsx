
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const activatePremium = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Authentication error. Please log in again.");
          navigate('/login');
          return;
        }

        const { error } = await supabase
          .from('user_access')
          .update({
            has_premium: true,
            trial_end: null,
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast.success("Welcome to Premium! You now have full access.");
        setIsProcessing(false);
        
        // Give user time to see the success message
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        console.error('Error activating premium:', error);
        toast.error("There was an error activating your premium access");
        setIsProcessing(false);
      }
    };

    activatePremium();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-locale-500" />
            <h1 className="text-2xl font-bold mb-4">Processing Your Payment</h1>
            <p className="text-gray-600">Please wait while we activate your premium access...</p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-gray-600">Your premium access has been activated. Redirecting you to the home page...</p>
          </>
        )}
      </div>
    </div>
  );
}
