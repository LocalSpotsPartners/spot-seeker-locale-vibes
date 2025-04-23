
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { SignupChoices } from './SignupChoices';
import { toast } from "sonner";

interface SignupFormProps {
  onToggleForm: () => void;
}

export function SignupForm({ onToggleForm }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signup(email, password);
      toast.success("Signup successful! Please check your email to confirm your account before choosing a plan.");
      setShowChoices(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  if (showChoices) {
    return (
      <div>
        <SignupChoices />
        <div className="mt-6 bg-blue-100 text-blue-700 p-4 rounded text-center">
          <p className="font-semibold">Important: Email Confirmation Required</p>
          <p>Please check your inbox and confirm your email address before you can use Locale Spots.</p>
          <p className="mt-2 text-sm">Didn't receive an email? Check your spam folder or try again with a different email address.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-500 rounded-md">
          {error}
        </div>
      )}
      <div>
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={onToggleForm}
            type="button"
            className="font-medium text-locale-500 hover:text-locale-600"
          >
            Log in
          </button>
        </p>
      </div>
    </form>
  );
}
