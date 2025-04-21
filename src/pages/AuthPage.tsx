
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  return <AuthScreen />;
}
