
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const activatePremium = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { error } = await supabase
          .from('user_access')
          .update({
            has_premium: true,
            trial_end: null,
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast.success("Welcome to Premium! You now have full access.");
        navigate('/');
      } catch (error) {
        console.error('Error activating premium:', error);
        toast.error("There was an error activating your premium access");
      }
    };

    activatePremium();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Your Payment</h1>
        <p className="text-gray-600">Please wait while we activate your premium access...</p>
      </div>
    </div>
  );
}
