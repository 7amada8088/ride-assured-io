import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, Ticket, User, LayoutDashboard, Bus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const { role } = useAuth();
  const location = useLocation();

  const commuterTabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/routes", label: "Routes", icon: MapPin },
    { to: "/trips", label: "My Trips", icon: Ticket },
    { to: "/profile", label: "Profile", icon: User },
  ];
  const driverTabs = [
    { to: "/driver", label: "Trips", icon: Bus },
    { to: "/profile", label: "Profile", icon: User },
  ];
  const adminTabs = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/routes", label: "Routes", icon: MapPin },
    { to: "/admin/trips", label: "Trips", icon: Bus },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const tabs = role === "admin" ? adminTabs : role === "driver" ? driverTabs : commuterTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-md">
      <div className="max-w-md mx-auto flex justify-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 transition-base",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
