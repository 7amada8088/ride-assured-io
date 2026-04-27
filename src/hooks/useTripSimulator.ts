import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Driver-side GPS simulator. While `enabled` is true and a tripId is given,
 * pushes incremental progress (0→1) into `trips.current_lat` every 3s.
 * Real GPS would replace this with navigator.geolocation.watchPosition.
 */
export const useTripSimulator = (tripId: string | null, enabled: boolean) => {
  const progressRef = useRef(0);

  useEffect(() => {
    if (!tripId || !enabled) return;

    // Resume from current value
    supabase
      .from("trips")
      .select("current_lat")
      .eq("id", tripId)
      .maybeSingle()
      .then(({ data }) => {
        progressRef.current = Math.max(0, Math.min(1, Number(data?.current_lat ?? 0)));
      });

    const interval = setInterval(async () => {
      progressRef.current = Math.min(1, progressRef.current + 0.03);
      await supabase
        .from("trips")
        .update({ current_lat: progressRef.current, current_lng: 0 })
        .eq("id", tripId);
      if (progressRef.current >= 1) clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, [tripId, enabled]);
};
