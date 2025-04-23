
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
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

  // Extract first name and last name from metadata if available
  const firstName = user.firstName || user.name.split(' ')[0];
  const lastName = user.lastName || user.name.split(' ').slice(1).join(' ');

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
            {(firstName || lastName) && (
              <CardContent className="border-t pt-4">
                <div className="flex flex-col space-y-1">
                  {firstName && <p className="text-sm"><span className="font-medium">First Name:</span> {firstName}</p>}
                  {lastName && <p className="text-sm"><span className="font-medium">Last Name:</span> {lastName}</p>}
                </div>
              </CardContent>
            )}
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
                onClick={handleLogout}
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
