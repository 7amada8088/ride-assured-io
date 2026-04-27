// Cairo area locations with approximate lat/lng + normalized SVG coords (0..1)
// SVG bbox covers roughly: lng 31.0 .. 31.55, lat 30.20 .. 29.90 (north→top)

export interface CairoLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const CAIRO_BOUNDS = {
  minLng: 30.95,
  maxLng: 31.55,
  minLat: 29.85,
  maxLat: 30.25,
};

export const CAIRO_LOCATIONS: CairoLocation[] = [
  { id: "maadi", name: "Maadi", lat: 29.96, lng: 31.25 },
  { id: "nasr-city", name: "Nasr City", lat: 30.06, lng: 31.34 },
  { id: "heliopolis", name: "Heliopolis", lat: 30.09, lng: 31.32 },
  { id: "tahrir", name: "Tahrir / Downtown", lat: 30.045, lng: 31.235 },
  { id: "zamalek", name: "Zamalek", lat: 30.06, lng: 31.22 },
  { id: "dokki", name: "Dokki", lat: 30.04, lng: 31.21 },
  { id: "mohandessin", name: "Mohandessin", lat: 30.06, lng: 31.20 },
  { id: "6october", name: "6th of October", lat: 29.96, lng: 30.95 },
  { id: "sheikh-zayed", name: "Sheikh Zayed", lat: 30.04, lng: 30.97 },
  { id: "new-cairo", name: "New Cairo", lat: 30.03, lng: 31.47 },
  { id: "auc", name: "AUC New Cairo", lat: 30.02, lng: 31.50 },
  { id: "guc", name: "GUC", lat: 29.99, lng: 31.45 },
  { id: "smart-village", name: "Smart Village", lat: 30.07, lng: 31.02 },
  { id: "rehab", name: "El Rehab", lat: 30.06, lng: 31.49 },
  { id: "shorouk", name: "El Shorouk", lat: 30.13, lng: 31.62 },
  { id: "giza", name: "Giza", lat: 30.01, lng: 31.21 },
];

export const toSvg = (lat: number, lng: number, w: number, h: number) => {
  const x = ((lng - CAIRO_BOUNDS.minLng) / (CAIRO_BOUNDS.maxLng - CAIRO_BOUNDS.minLng)) * w;
  const y = ((CAIRO_BOUNDS.maxLat - lat) / (CAIRO_BOUNDS.maxLat - CAIRO_BOUNDS.minLat)) * h;
  return { x: Math.max(0, Math.min(w, x)), y: Math.max(0, Math.min(h, y)) };
};

// Find closest Cairo location to arbitrary lat/lng
export const closestLocation = (lat: number, lng: number): CairoLocation => {
  let best = CAIRO_LOCATIONS[0];
  let bestD = Infinity;
  for (const l of CAIRO_LOCATIONS) {
    const d = (l.lat - lat) ** 2 + (l.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = l;
    }
  }
  return best;
};
