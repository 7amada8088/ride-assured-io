import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Search, Zap } from "lucide-react";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  base_price: number;
  estimated_duration_min: number;
  is_dynamic: boolean;
}

const Routes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("routes")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setRoutes(data ?? []));
  }, []);

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.origin.toLowerCase().includes(q.toLowerCase()) ||
      r.destination.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell title="Routes" subtitle="Pick a route, see live trips">
      <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search Maadi, AUC..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="space-y-3 mt-5">
        {filtered.map((r) => (
          <Link key={r.id} to={`/route/${r.id}`}>
            <Card className="p-4 hover:shadow-elegant transition-base bg-gradient-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{r.name}</h3>
                    {r.is_dynamic && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Zap className="h-2.5 w-2.5" /> Dynamic
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {r.origin} → {r.destination}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{r.estimated_duration_min} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{r.base_price}</p>
                  <p className="text-[10px] text-muted-foreground">EGP / seat</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No routes match your search.</p>
        )}
      </div>
    </AppShell>
  );
};

export default Routes;
