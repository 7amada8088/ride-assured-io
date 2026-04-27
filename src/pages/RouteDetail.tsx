import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  base_price: number;
  stops: any;
}
interface Trip {
  id: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  status: string;
}

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: r } = await supabase.from("routes").select("*").eq("id", id).maybeSingle();
      setRoute(r);
      const { data: t } = await supabase
        .from("trips")
        .select("*")
        .eq("route_id", id)
        .eq("status", "scheduled")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time")
        .limit(20);
      setTrips(t ?? []);
    })();
  }, [id]);

  const handleBook = async (tripId: string) => {
    setBookingId(tripId);
    const { data, error } = await supabase.rpc("book_seat", { _trip_id: tripId });
    setBookingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Seat ${(data as any).seat_number} reserved!`);
    navigate("/trips");
  };

  if (!route) return <AppShell title="Loading..."><Loader2 className="animate-spin mx-auto mt-10" /></AppShell>;

  return (
    <AppShell title={route.name} subtitle={`${route.origin} → ${route.destination}`}>
      <Card className="p-4 mt-2 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Price per seat</p>
            <p className="text-2xl font-bold text-primary">{route.base_price} EGP</p>
          </div>
          <Badge variant="secondary">Guaranteed seat</Badge>
        </div>
        {Array.isArray(route.stops) && route.stops.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Stops along the way</p>
            <div className="flex flex-wrap gap-1.5">
              {route.stops.map((s: string) => (
                <Badge key={s} variant="outline" className="text-[10px]">
                  <MapPin className="h-2.5 w-2.5 mr-1" />{s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <h2 className="text-sm font-semibold text-muted-foreground mt-6 mb-2">Upcoming trips</h2>
      <div className="space-y-2">
        {trips.map((t) => {
          const dep = new Date(t.departure_time);
          const sold = t.total_seats - t.available_seats;
          const pct = (sold / t.total_seats) * 100;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {dep.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {t.available_seats}/{t.total_seats}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={t.available_seats > 0 ? "hero" : "outline"}
                  disabled={t.available_seats === 0 || bookingId === t.id}
                  onClick={() => handleBook(t.id)}
                >
                  {bookingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t.available_seats > 0 ? "Book" : "Full"}
                </Button>
              </div>
            </Card>
          );
        })}
        {trips.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No upcoming trips.</p>
        )}
      </div>
    </AppShell>
  );
};

export default RouteDetail;
