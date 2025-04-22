
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function SignupChoices() {
  const navigate = useNavigate();

  const startFreeTrial = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { error } = await supabase
        .from('user_access')
        .update({
          trial_end: tomorrow.toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Free trial activated!");
      navigate('/');
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error("Failed to start trial");
    }
  };

  const startPremium = async () => {
    try {
      const { data: { data, error } } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error("Failed to initiate payment");
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
          <Button onClick={startFreeTrial} className="w-full" variant="outline">
            Start Free Trial
          </Button>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow border-blue-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold">Premium</h3>
          </div>
          <p className="text-gray-600">Get unlimited access for just €5</p>
          <Button onClick={startPremium} className="w-full">
            Go Premium
          </Button>
        </Card>
      </div>
    </div>
  );
}
