import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { MapPin, Bus, Users, Ticket, ArrowRight } from "lucide-react";

const Admin = () => {
  const [stats, setStats] = useState({ routes: 0, trips: 0, bookings: 0, users: 0 });

  useEffect(() => {
    (async () => {
      const [routes, trips, bookings, users] = await Promise.all([
        supabase.from("routes").select("id", { count: "exact", head: true }),
        supabase.from("trips").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        routes: routes.count ?? 0,
        trips: trips.count ?? 0,
        bookings: bookings.count ?? 0,
        users: users.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Routes", value: stats.routes, icon: MapPin },
    { label: "Trips", value: stats.trips, icon: Bus },
    { label: "Bookings", value: stats.bookings, icon: Ticket },
    { label: "Users", value: stats.users, icon: Users },
  ];

  return (
    <AppShell title="Admin" subtitle="Operations overview">
      <div className="grid grid-cols-2 gap-3 mt-2">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 bg-gradient-card">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground mt-6 mb-2">Manage</h2>
      <div className="space-y-2">
        {[
          { to: "/admin/routes", label: "Routes & pricing" },
          { to: "/admin/trips", label: "Trips & assignments" },
        ].map(({ to, label }) => (
          <Link key={to} to={to}>
            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-base">
              <span className="font-medium">{label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
};

export default Admin;
