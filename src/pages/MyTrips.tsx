import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Ticket, MapPin, X } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  seat_number: number;
  status: string;
  price: number;
  trips: {
    id: string;
    departure_time: string;
    status: string;
    routes: { name: string; origin: string; destination: string } | null;
  } | null;
}

const MyTrips = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("id, seat_number, status, price, trips(id, departure_time, status, routes(name, origin, destination))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as any) ?? []);
  };

  useEffect(() => {
    load();
  }, [user]);

  const cancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Booking cancelled");
      load();
    }
  };

  return (
    <AppShell title="My trips" subtitle="Your bookings and history">
      <div className="space-y-3 mt-2">
        {bookings.map((b) => {
          const upcoming = b.trips && new Date(b.trips.departure_time) > new Date();
          const cancelled = b.status === "cancelled";
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    cancelled
                      ? "bg-destructive text-destructive-foreground"
                      : upcoming
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {cancelled ? "Cancelled" : upcoming ? "Upcoming" : "Past"}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Ticket className="h-3 w-3" /> Seat {b.seat_number}
                </span>
              </div>
              <p className="font-semibold mt-2">{b.trips?.routes?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {b.trips?.routes?.origin} → {b.trips?.routes?.destination}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {b.trips && new Date(b.trips.departure_time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <span className="text-sm font-semibold">{b.price} EGP</span>
              </div>
              {upcoming && !cancelled && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-destructive" onClick={() => cancel(b.id)}>
                  <X className="h-4 w-4" /> Cancel booking
                </Button>
              )}
            </Card>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No bookings yet.</p>
        )}
      </div>
    </AppShell>
  );
};

export default MyTrips;
