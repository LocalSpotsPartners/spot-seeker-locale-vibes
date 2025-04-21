
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { initDB } from "@/db/database";

// Pages
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import WishlistPage from "./pages/WishlistPage";
import { BottomNav } from "@/components/layout/BottomNav";

const queryClient = new QueryClient();

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
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/place/:id" element={<PlaceDetailPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
