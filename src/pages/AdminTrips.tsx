import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Bus, Clock } from "lucide-react";
import { toast } from "sonner";

const AdminTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ route_id: "", vehicle_id: "", driver_id: "", departure_time: "" });

  const load = async () => {
    const [{ data: t }, { data: r }, { data: v }, { data: d }] = await Promise.all([
      supabase.from("trips").select("*, routes(name), vehicles(plate_number, capacity), drivers(id)").order("departure_time", { ascending: false }).limit(50),
      supabase.from("routes").select("id, name").eq("is_active", true),
      supabase.from("vehicles").select("id, plate_number, capacity"),
      supabase.from("drivers").select("id, user_id"),
    ]);
    setTrips(t ?? []); setRoutes(r ?? []); setVehicles(v ?? []); setDrivers(d ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const v = vehicles.find((x) => x.id === form.vehicle_id);
    const cap = v?.capacity ?? 14;
    const { error } = await supabase.from("trips").insert({
      route_id: form.route_id,
      vehicle_id: form.vehicle_id || null,
      driver_id: form.driver_id || null,
      departure_time: form.departure_time,
      total_seats: cap,
      available_seats: cap,
    });
    if (error) toast.error(error.message);
    else { toast.success("Trip created"); setOpen(false); load(); }
  };

  return (
    <AppShell title="Trips" subtitle="Schedule and assign drivers">
      <Button variant="hero" className="w-full mt-2" onClick={() => setOpen(!open)}>
        <Plus className="h-4 w-4" /> {open ? "Close" : "New trip"}
      </Button>
      {open && (
        <Card className="p-4 mt-3 space-y-2">
          <div>
            <Label>Route</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.route_id} onChange={(e) => setForm({ ...form, route_id: e.target.value })}>
              <option value="">Select…</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Vehicle</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Select…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number} ({v.capacity} seats)</option>)}
            </select>
          </div>
          <div>
            <Label>Driver (optional)</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">Unassigned</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.id.slice(0, 8)}</option>)}
            </select>
          </div>
          <div>
            <Label>Departure</Label>
            <Input type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
          </div>
          <Button className="w-full" onClick={create}>Create trip</Button>
        </Card>
      )}

      <div className="space-y-2 mt-5">
        {trips.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{t.status.replace("_", " ")}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(t.departure_time).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
            <p className="font-semibold mt-2">{t.routes?.name}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> {t.vehicles?.plate_number ?? "—"}</span>
              <span>{t.available_seats}/{t.total_seats} free</span>
              <span>{t.drivers ? "Assigned" : "No driver"}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminTrips;
