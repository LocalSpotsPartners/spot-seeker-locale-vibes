
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Facebook, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function LoginForm({ onToggleForm }: { onToggleForm: () => void }) {
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    try {
      await socialLogin(provider);
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to login with ${provider}`);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4">
        <Button 
          variant="outline" 
          type="button" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleSocialLogin('google')}
        >
          <Facebook size={18} />
          <span>Continue with Google</span>
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleSocialLogin('apple')}
        >
          <Linkedin size={18} />
          <span>Continue with Apple</span>
        </Button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            onClick={onToggleForm}
            className="font-medium text-locale-500 hover:text-locale-600"
          >
            Sign up
          </button>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Demo credentials are pre-filled for you
        </p>
      </div>
    </div>
  );
}
