import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { initDB } from "@/db/database";
import { useAuth } from "@/contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import { BottomNav } from "@/components/layout/BottomNav";
import { AccessCheck } from "@/components/auth/AccessCheck";
import { PaymentSuccess } from "@/components/auth/PaymentSuccess";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? (
          <AccessCheck>
            <Home />
          </AccessCheck>
        ) : (
          <Navigate to="/login" replace />
        )} 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <AccessCheck>
              <MapPage />
            </AccessCheck>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/place/:id" 
        element={
          <ProtectedRoute>
            <AccessCheck>
              <PlaceDetailPage />
            </AccessCheck>
          </ProtectedRoute>
        } 
      />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute>
            <AccessCheck>
              <WishlistPage />
            </AccessCheck>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AccessCheck>
              <ProfilePage />
            </AccessCheck>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Initialize the database when the app starts
  useEffect(() => {
    initDB().catch(err => console.error("Failed to initialize database:", err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pb-16">
              <AppRoutes />
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
