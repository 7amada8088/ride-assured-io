import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Play, Flag } from "lucide-react";
import { toast } from "sonner";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";
import { useTripSimulator } from "@/hooks/useTripSimulator";

interface Trip {
  id: string;
  departure_time: string;
  status: string;
  total_seats: number;
  available_seats: number;
  routes: { name: string; origin: string; destination: string } | null;
}

const Driver = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [driverId, setDriverId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: d } = await supabase.from("drivers").select("id").eq("user_id", user.id).maybeSingle();
    if (!d) { setTrips([]); return; }
    setDriverId(d.id);
    const { data } = await supabase
      .from("trips")
      .select("*, routes(name, origin, destination)")
      .eq("driver_id", d.id)
      .order("departure_time", { ascending: true });
    setTrips((data as any) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id: string, status: "in_progress" | "completed") => {
    const updates: Record<string, unknown> = { status };
    if (status === "in_progress") updates.current_lat = 0;
    if (status === "completed") updates.current_lat = 1;
    const { error } = await supabase.from("trips").update(updates).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Trip ${status.replace("_", " ")}`); load(); }
  };

  // Simulate GPS for the first in-progress trip
  const activeTrip = trips.find((t) => t.status === "in_progress");
  useTripSimulator(activeTrip?.id ?? null, !!activeTrip);

  if (!driverId) {
    return (
      <AppShell title="Driver">
        <Card className="p-6 mt-4 text-center">
          <p className="text-sm text-muted-foreground">You are signed in as a driver but no driver record is linked yet. Please contact your admin.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="My trips" subtitle="Drive — never cancel">
      <div className="space-y-3 mt-2">
        {trips.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <Badge
                className={
                  t.status === "in_progress" ? "bg-accent text-accent-foreground"
                  : t.status === "completed" ? "bg-muted text-muted-foreground"
                  : "bg-success text-success-foreground"
                }
              >
                {t.status.replace("_", " ")}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(t.departure_time).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
            <p className="font-semibold mt-2">{t.routes?.name}</p>
            <p className="text-xs text-muted-foreground">{t.routes?.origin} → {t.routes?.destination}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> {t.total_seats - t.available_seats} passengers booked
            </p>
            <div className="flex gap-2 mt-3">
              {t.status === "scheduled" && (
                <Button variant="hero" size="sm" className="flex-1" onClick={() => updateStatus(t.id, "in_progress")}>
                  <Play className="h-4 w-4" /> Start trip
                </Button>
              )}
              {t.status === "in_progress" && (
                <Button variant="success" size="sm" className="flex-1" onClick={() => updateStatus(t.id, "completed")}>
                  <Flag className="h-4 w-4" /> Finish trip
                </Button>
              )}
            </div>
            {(t.status === "in_progress" || t.status === "scheduled") && (
              <div className="mt-3">
                <LiveTrackingMap tripId={t.id} origin={t.routes?.origin} destination={t.routes?.destination} />
              </div>
            )}
          </Card>
        ))}
        {trips.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No assigned trips.</p>
        )}
      </div>
    </AppShell>
  );
};

export default Driver;
