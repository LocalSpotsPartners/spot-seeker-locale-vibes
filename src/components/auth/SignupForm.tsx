
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { SignupChoices } from './SignupChoices';
import { supabase } from "@/integrations/supabase/client";

interface SignupFormProps {
  onToggleForm: () => void;
}

export function SignupForm({ onToggleForm }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Sign up the user
      await signup(email, password);
      
      // Wait a moment to ensure the session is established
      setTimeout(() => {
        // Check if we have a session before showing choices
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.log("Session established after signup, showing choices");
            setShowChoices(true);
          } else {
            console.error("No session after signup");
            setError("Signup successful but couldn't establish a session. Please try logging in.");
          }
        });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    }
  };

  if (showChoices) {
    return <SignupChoices />;
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
      <Button type="submit" className="w-full">
        Sign Up
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
