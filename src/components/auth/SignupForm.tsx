
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface SignupFormProps {
  onToggleForm: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
});

export function SignupForm({ onToggleForm }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await signup(values.email, values.password, {
        name: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName
      });

      toast.success("Signup successful! Please check your email to confirm your account before choosing a plan.");
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      toast.error(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-blue-100 text-blue-700 p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Verify Your Email</h3>
          <p>We've sent a verification link to your email address.</p>
          <p className="mt-2">Please check your inbox and click the verification link to complete your signup.</p>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>After verifying your email, you'll be able to choose your plan.</p>
          <p className="mt-2">Didn't receive the email? Check your spam folder or try again with a different email address.</p>
        </div>
        
        <Button 
          variant="outline"
          onClick={onToggleForm}
          className="mt-4"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-100 text-red-500 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
    </Form>
  );
}
