
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Map, User } from "lucide-react";

const navItems = [
  { to: "/", icon: <Home />, label: "Home" },
  { to: "/wishlist", icon: <Heart />, label: "Wish List" },
  { to: "/map", icon: <Map />, label: "Map" },
  { to: "/profile", icon: <User />, label: "Profile" }
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <Link
              to={item.to}
              key={item.label}
              className={`flex flex-col items-center text-xs px-3 py-1 transition-colors ${
                isActive ? "text-locale-500 font-bold" : "text-gray-400"
              }`}
              aria-label={item.label}
            >
              <span className="mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
