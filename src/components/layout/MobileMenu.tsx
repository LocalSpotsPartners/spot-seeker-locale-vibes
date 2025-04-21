
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, LogOut, Map, MapPin, User } from "lucide-react";

export function MobileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close the menu when clicking a link
  const closeMenu = () => setIsOpen(false);
  
  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon" className="md:hidden">
          <MenuIcon />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 py-4 border-b">
            <MapPin className="h-5 w-5 text-locale-500" />
            <span className="font-bold">Locale Spots</span>
          </div>
          
          <nav className="flex flex-col gap-1 py-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/map"
              onClick={closeMenu}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent"
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Link>
            
            {user && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            )}
          </nav>
          
          <div className="mt-auto py-4 border-t">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                  <div className="h-8 w-8 rounded-full bg-locale-100 text-locale-600 flex items-center justify-center">
                    {user.name.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center w-full gap-2"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Button asChild className="w-full" onClick={closeMenu}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={closeMenu}>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
