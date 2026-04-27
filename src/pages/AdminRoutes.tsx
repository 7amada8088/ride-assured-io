import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  base_price: number;
  is_active: boolean;
}

const AdminRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", origin: "", destination: "", base_price: 30 });

  const load = async () => {
    const { data } = await supabase.from("routes").select("*").order("name");
    setRoutes(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { error } = await supabase.from("routes").insert({ ...form });
    if (error) toast.error(error.message);
    else { toast.success("Route created"); setOpen(false); setForm({ name: "", origin: "", destination: "", base_price: 30 }); load(); }
  };

  return (
    <AppShell title="Routes" subtitle="Manage fixed and dynamic routes">
      <Button variant="hero" className="w-full mt-2" onClick={() => setOpen(!open)}>
        <Plus className="h-4 w-4" /> {open ? "Close" : "New route"}
      </Button>
      {open && (
        <Card className="p-4 mt-3 space-y-2">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Origin</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
          <div><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
          <div><Label>Base price (EGP)</Label><Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} /></div>
          <Button onClick={create} className="w-full">Create</Button>
        </Card>
      )}

      <div className="space-y-2 mt-5">
        {routes.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {r.origin} → {r.destination}
                </p>
              </div>
              <span className="text-sm font-bold text-primary">{r.base_price} EGP</span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminRoutes;
