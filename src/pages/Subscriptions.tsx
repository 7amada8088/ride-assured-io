import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check } from "lucide-react";
import { toast } from "sonner";

interface Route { id: string; name: string; base_price: number; }
interface Sub { id: string; plan: string; start_date: string; end_date: string; status: string; routes: { name: string } | null; }

const PLANS = [
  { plan: "weekly" as const, label: "Weekly", multiplier: 5, days: 7, savings: "Save 30%" },
  { plan: "monthly" as const, label: "Monthly", multiplier: 18, days: 30, savings: "Best value — Save 40%" },
];

const Subscriptions = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const load = async () => {
    const { data: r } = await supabase.from("routes").select("id, name, base_price").eq("is_active", true);
    setRoutes(r ?? []);
    if (r && r[0]) setSelectedRoute(r[0].id);
    if (user) {
      const { data: s } = await supabase
        .from("subscriptions")
        .select("id, plan, start_date, end_date, status, routes(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSubs((s as any) ?? []);
    }
  };

  useEffect(() => { load(); }, [user]);

  const subscribe = async (plan: "weekly" | "monthly", days: number, multiplier: number) => {
    if (!user || !selectedRoute) return;
    const route = routes.find((r) => r.id === selectedRoute);
    if (!route) return;
    const price = Number((route.base_price * multiplier).toFixed(2));
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      route_id: selectedRoute,
      plan,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      price,
      status: "active",
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("payments").insert({ user_id: user.id, amount: price, type: "subscription", status: "succeeded" });
    toast.success("Subscription activated! (simulated payment)");
    load();
  };

  const route = routes.find((r) => r.id === selectedRoute);

  return (
    <AppShell title="Subscriptions" subtitle="Save with weekly or monthly plans">
      <div className="mt-2">
        <label className="text-xs text-muted-foreground">Route</label>
        <select
          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="space-y-3 mt-5">
        {PLANS.map((p) => {
          const price = route ? (route.base_price * p.multiplier).toFixed(0) : "—";
          return (
            <Card key={p.plan} className="p-4 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.label}</p>
                  <p className="text-xs text-accent font-medium mt-0.5">{p.savings}</p>
                </div>
                <p className="text-2xl font-bold text-primary">{price} <span className="text-xs font-normal text-muted-foreground">EGP</span></p>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> Guaranteed seat every trip</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> Priority booking</li>
                <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> No driver cancellations</li>
              </ul>
              <Button variant="hero" className="w-full mt-4" onClick={() => subscribe(p.plan, p.days, p.multiplier)}>
                Subscribe
              </Button>
            </Card>
          );
        })}
      </div>

      {subs.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground mt-8 mb-2">Your subscriptions</h2>
          <div className="space-y-2">
            {subs.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <Badge className={s.status === "active" ? "bg-success text-success-foreground" : "bg-muted"}>{s.status}</Badge>
                  <span className="text-xs text-muted-foreground capitalize">{s.plan}</span>
                </div>
                <p className="font-semibold mt-2">{s.routes?.name}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {s.start_date} → {s.end_date}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
};

export default Subscriptions;
