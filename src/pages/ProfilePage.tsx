
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Settings, Crown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user, logout, subscription, activateTrial, upgradeToPremium, cancelPremium } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handlePremiumToggle = () => {
    if (subscription.isPremium) {
      cancelPremium();
      toast.success("Premium subscription cancelled");
    } else {
      upgradeToPremium();
      toast.success("Successfully upgraded to Premium!");
    }
  };

  const handleTrialActivation = () => {
    activateTrial();
    toast.success("Free trial activated! Enjoy premium features for 24 hours.");
  };

  const formatTrialEndTime = () => {
    if (!subscription.trialEndDate) return "";
    
    const endDate = new Date(subscription.trialEndDate);
    return endDate.toLocaleString();
  };

  const trialTimeRemaining = () => {
    if (!subscription.trialEndDate) return "";
    
    const now = new Date();
    const endDate = new Date(subscription.trialEndDate);
    const remainingMs = endDate.getTime() - now.getTime();
    
    if (remainingMs <= 0) return "Expired";
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <p>Please log in to view your profile</p>
          <Button className="mt-4" asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 pb-20">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="grid gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || ""} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  {user.provider && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)} Account
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {/* Subscription Card */}
          <Card className={subscription.isPremium ? "border-2 border-green-500" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className={`h-5 w-5 ${subscription.isPremium ? "text-yellow-500" : ""}`} />
                Subscription
              </CardTitle>
              <CardDescription>
                {subscription.isPremium 
                  ? "You're enjoying premium features" 
                  : subscription.isTrialActive 
                    ? "Your free trial is active" 
                    : "Upgrade to access premium features"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status */}
              <div className="text-sm">
                <p className="font-medium">Current Plan:</p>
                <p className={`${subscription.isPremium ? "text-green-600" : ""}`}>
                  {subscription.isPremium ? "Premium" : "Free"}
                </p>
              </div>

              {subscription.isTrialActive && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm">
                    <span className="font-medium">Free trial active:</span> {trialTimeRemaining()}
                    <p className="text-xs mt-1">Ends on {formatTrialEndTime()}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Premium Toggle */}
              <div className="flex items-center space-x-4 justify-between pt-4">
                <div>
                  <p className="font-medium">Premium Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Unlock exclusive features and premium locations
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="premium-mode" 
                    checked={subscription.isPremium} 
                    onCheckedChange={handlePremiumToggle}
                  />
                  <Label htmlFor="premium-mode">
                    {subscription.isPremium ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
              
              {/* Free Trial Button */}
              {!subscription.isPremium && !subscription.isTrialActive && (
                <Button 
                  variant="outline" 
                  onClick={handleTrialActivation} 
                  className="w-full mt-2"
                >
                  Start 24-Hour Free Trial
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications Setting */}
              <div className="flex items-center space-x-4 justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new spots in your area
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
