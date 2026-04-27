import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bus, MapPin, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  tripId: string;
  origin?: string;
  destination?: string;
}

interface TripPos {
  status: string;
  current_lat: number | null;
  current_lng: number | null;
}

/**
 * Lightweight live-tracking map (no external map provider needed).
 * Renders an SVG road from Origin → Destination and animates the shuttle
 * marker based on `trips.current_lat` (used as 0..1 progress) updated in
 * realtime via Supabase Postgres Changes.
 */
export const LiveTrackingMap = ({ tripId, origin = "Origin", destination = "Destination" }: Props) => {
  const [pos, setPos] = useState<TripPos | null>(null);

  // Initial fetch + realtime subscription
  useEffect(() => {
    let mounted = true;
    supabase
      .from("trips")
      .select("status, current_lat, current_lng")
      .eq("id", tripId)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setPos(data as TripPos);
      });

    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trips", filter: `id=eq.${tripId}` },
        (payload) => {
          const n = payload.new as TripPos;
          setPos({ status: n.status, current_lat: n.current_lat, current_lng: n.current_lng });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  // We encode 0..1 progress in current_lat for the simulation.
  const progress = useMemo(() => {
    if (!pos) return 0;
    if (pos.status === "completed") return 1;
    if (pos.status !== "in_progress") return 0;
    const p = Number(pos.current_lat ?? 0);
    return Math.max(0, Math.min(1, p));
  }, [pos]);

  // Curved path from origin (left) to destination (right)
  const W = 360;
  const H = 160;
  const path = `M 30 ${H - 30} Q ${W / 2} 20, ${W - 30} ${H - 30}`;

  // Compute point on quadratic bezier
  const point = useMemo(() => {
    const t = progress;
    const x0 = 30, y0 = H - 30;
    const x1 = W / 2, y1 = 20;
    const x2 = W - 30, y2 = H - 30;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
    return { x, y };
  }, [progress]);

  const statusLabel =
    pos?.status === "in_progress" ? "Live" :
    pos?.status === "completed" ? "Arrived" :
    pos?.status === "scheduled" ? "Not started" :
    pos?.status ?? "—";

  return (
    <Card className="p-4 bg-gradient-card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Live tracking</span>
        <Badge
          className={
            pos?.status === "in_progress"
              ? "bg-success text-success-foreground animate-pulse"
              : pos?.status === "completed"
              ? "bg-muted text-muted-foreground"
              : "bg-secondary text-secondary-foreground"
          }
        >
          {statusLabel}
        </Badge>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 rounded-lg bg-muted/40">
        {/* Dashed road */}
        <path
          d={path}
          stroke="hsl(var(--muted-foreground) / 0.4)"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
        />
        {/* Traveled portion */}
        <path
          d={path}
          stroke="hsl(var(--primary))"
          strokeWidth="3.5"
          fill="none"
          strokeDasharray={`${progress * 360} 360`}
        />
        {/* Origin marker */}
        <circle cx={30} cy={H - 30} r="7" fill="hsl(var(--secondary))" />
        <circle cx={30} cy={H - 30} r="3" fill="white" />
        {/* Destination marker */}
        <circle cx={W - 30} cy={H - 30} r="7" fill="hsl(var(--accent))" />
        <circle cx={W - 30} cy={H - 30} r="3" fill="white" />

        {/* Bus marker */}
        <g transform={`translate(${point.x - 14} ${point.y - 14})`}>
          <circle cx="14" cy="14" r="14" fill="hsl(var(--primary))" opacity="0.25" />
          <circle cx="14" cy="14" r="10" fill="hsl(var(--primary))" />
        </g>
      </svg>

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{origin}</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-primary">
          <Bus className="h-3.5 w-3.5" />
          {Math.round(progress * 100)}%
        </div>
        <div className="flex items-center gap-1 text-muted-foreground min-w-0 justify-end">
          <span className="truncate">{destination}</span>
          <Flag className="h-3 w-3 shrink-0" />
        </div>
      </div>
    </Card>
  );
};
