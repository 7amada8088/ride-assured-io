import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowRight, ShieldCheck, Zap, Calendar } from "lucide-react";
import heroImg from "@/assets/hero-shuttle.jpg";

interface NextTrip {
  id: string;
  departure_time: string;
  available_seats: number;
  routes: { name: string; origin: string; destination: string } | null;
}

const Home = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [nextTrip, setNextTrip] = useState<NextTrip | null>(null);
  const [activeSubs, setActiveSubs] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (profile?.full_name) setName(profile.full_name.split(" ")[0]);

      const { data: bookings } = await supabase
        .from("bookings")
        .select("trip_id, trips!inner(id, departure_time, available_seats, routes(name, origin, destination))")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("trips.departure_time", new Date().toISOString())
        .order("trips(departure_time)", { ascending: true })
        .limit(1);
      if (bookings && bookings[0]) setNextTrip(bookings[0].trips as any);

      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");
      setActiveSubs(count ?? 0);
    })();
  }, [user]);

  return (
    <AppShell>
      <div className="-mx-5 px-5 pt-6 pb-8 bg-gradient-hero text-primary-foreground rounded-b-3xl shadow-elegant">
        <p className="text-sm opacity-90">Good day{name ? `, ${name}` : ""} 👋</p>
        <h1 className="text-2xl font-bold mt-1">Where are you heading?</h1>
        <Link to="/plan">
          <Button variant="secondary" size="xl" className="w-full mt-5 shadow-md">
            <MapPin className="mr-1" /> Plan a trip (From → To)
          </Button>
        </Link>
        <Link to="/routes">
          <Button variant="ghost" size="sm" className="w-full mt-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            Or browse all routes
          </Button>
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, label: "Guaranteed seat" },
          { icon: Zap, label: "No cancels" },
          { icon: Calendar, label: "Subscriptions" },
        ].map(({ icon: Icon, label }) => (
          <Card key={label} className="p-3 flex flex-col items-center text-center bg-gradient-card">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[11px] font-medium leading-tight">{label}</span>
          </Card>
        ))}
      </section>

      {nextTrip && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Your next trip</h2>
          <Link to={`/trips`}>
            <Card className="p-4 hover:shadow-elegant transition-base">
              <div className="flex items-center justify-between">
                <Badge className="bg-success text-success-foreground">Confirmed</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(nextTrip.departure_time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="font-semibold mt-2">{nextTrip.routes?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {nextTrip.routes?.origin} → {nextTrip.routes?.destination}
              </p>
            </Card>
          </Link>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Quick actions</h2>
        <div className="space-y-2">
          <Link to="/routes">
            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-base">
              <div>
                <p className="font-medium">Browse routes</p>
                <p className="text-xs text-muted-foreground">Fixed and dynamic options</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
          <Link to="/subscriptions">
            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-base">
              <div>
                <p className="font-medium">Subscriptions</p>
                <p className="text-xs text-muted-foreground">{activeSubs} active</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        </div>
      </section>

      <img src={heroImg} alt="Basy shuttle" className="rounded-2xl shadow-md mt-6 w-full" width={1536} height={1024} loading="lazy" />
    </AppShell>
  );
};

export default Home;
