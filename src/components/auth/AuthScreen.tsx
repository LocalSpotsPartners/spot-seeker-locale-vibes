
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-locale-500 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Locale Spots</h2>
          <p className="mt-1">Discover the best local spots</p>
        </div>
        <div className="p-6">
          {showLogin ? (
            <LoginForm onToggleForm={() => setShowLogin(false)} />
          ) : (
            <SignupForm onToggleForm={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
