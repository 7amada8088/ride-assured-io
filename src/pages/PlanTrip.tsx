import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CairoMap } from "@/components/CairoMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAIRO_LOCATIONS,
  closestLocation,
  type CairoLocation,
} from "@/lib/cairoLocations";
import { Locate, ArrowRight, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  base_price: number;
  estimated_duration_min: number;
}

const PlanTrip = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [from, setFrom] = useState<CairoLocation | null>(null);
  const [to, setTo] = useState<CairoLocation | null>(null);
  const [pickMode, setPickMode] = useState<"from" | "to">("from");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    supabase
      .from("routes")
      .select("id, name, origin, destination, base_price, estimated_duration_min")
      .eq("is_active", true)
      .then(({ data }) => setRoutes(data ?? []));
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        const nearest = closestLocation(latitude, longitude);
        setFrom(nearest);
        setLocating(false);
        toast.success(`Detected: ${nearest.name}`);
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePin = (loc: CairoLocation) => {
    if (pickMode === "from") {
      setFrom(loc);
      setPickMode("to");
    } else {
      setTo(loc);
    }
  };

  // Match routes by origin/destination text
  const matches = useMemo(() => {
    if (!from || !to) return [];
    const f = from.name.toLowerCase();
    const t = to.name.toLowerCase();
    return routes.filter(
      (r) =>
        (r.origin.toLowerCase().includes(f) || f.includes(r.origin.toLowerCase())) &&
        (r.destination.toLowerCase().includes(t) || t.includes(r.destination.toLowerCase()))
    );
  }, [from, to, routes]);

  const mapRoutes = useMemo(() => {
    if (from && to) return [{ from, to, highlighted: true }];
    return [];
  }, [from, to]);

  return (
    <AppShell title="Plan a trip" subtitle="Cairo only — pick From and To">
      <div className="space-y-3 mt-2">
        <Card className="p-3 space-y-2 bg-gradient-card">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-success/15 text-success border-0">From</Badge>
            <Select
              value={from?.id ?? ""}
              onValueChange={(v) => setFrom(CAIRO_LOCATIONS.find((l) => l.id === v) ?? null)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Pick origin" />
              </SelectTrigger>
              <SelectContent>
                {CAIRO_LOCATIONS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="outline" onClick={useMyLocation} disabled={locating} aria-label="Use my location">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-0">To</Badge>
            <Select
              value={to?.id ?? ""}
              onValueChange={(v) => setTo(CAIRO_LOCATIONS.find((l) => l.id === v) ?? null)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Pick destination" />
              </SelectTrigger>
              <SelectContent>
                {CAIRO_LOCATIONS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Tap a pin on the map — currently picking{" "}
            <span className="font-semibold text-foreground">{pickMode === "from" ? "From" : "To"}</span>
          </p>
        </Card>

        <CairoMap
          routes={mapRoutes}
          userLocation={userLoc}
          selectedFrom={from}
          selectedTo={to}
          onPickLocation={handlePin}
          height={300}
        />

        {from && to && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
              {matches.length > 0 ? "Available shuttles" : "No direct routes — try another pair"}
            </h2>
            <div className="space-y-2">
              {matches.map((r) => (
                <Card key={r.id} className="p-4 hover:shadow-elegant transition-base">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.origin} → {r.destination}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">~{r.estimated_duration_min} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-primary">{r.base_price} EGP</p>
                      <Button size="sm" variant="hero" className="mt-2" onClick={() => navigate(`/route/${r.id}`)}>
                        Book <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {matches.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Try nearby areas — or browse all routes.
                </p>
              )}
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/routes")}>
                Browse all routes
              </Button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default PlanTrip;
