import { CAIRO_LOCATIONS, toSvg, type CairoLocation } from "@/lib/cairoLocations";
import { MapPin, Navigation } from "lucide-react";

interface RouteLine {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  highlighted?: boolean;
}

interface Props {
  routes?: RouteLine[];
  userLocation?: { lat: number; lng: number } | null;
  selectedFrom?: CairoLocation | null;
  selectedTo?: CairoLocation | null;
  onPickLocation?: (loc: CairoLocation) => void;
  height?: number;
}

const W = 600;
const H = 420;

export const CairoMap = ({
  routes = [],
  userLocation,
  selectedFrom,
  selectedTo,
  onPickLocation,
  height = 280,
}: Props) => {
  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-border bg-muted relative"
      style={{ height }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Background — stylized "Cairo" */}
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </linearGradient>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#bg)" />
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Nile river — wavy band roughly through Cairo */}
        <path
          d={`M ${toSvg(30.25, 31.22, W, H).x} 0
              Q ${toSvg(30.10, 31.21, W, H).x} ${toSvg(30.10, 31.21, W, H).y}
                ${toSvg(30.05, 31.22, W, H).x} ${toSvg(30.05, 31.22, W, H).y}
              T ${toSvg(29.85, 31.24, W, H).x} ${H}`}
          stroke="hsl(195 75% 55%)"
          strokeWidth="14"
          fill="none"
          opacity="0.55"
          strokeLinecap="round"
        />

        {/* Ring road — rough circle */}
        <ellipse
          cx={toSvg(30.04, 31.27, W, H).x}
          cy={toSvg(30.04, 31.27, W, H).y}
          rx={140}
          ry={110}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />

        {/* Routes */}
        {routes.map((r, i) => {
          const a = toSvg(r.from.lat, r.from.lng, W, H);
          const b = toSvg(r.to.lat, r.to.lng, W, H);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={r.highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"}
              strokeWidth={r.highlighted ? 3.5 : 2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Location pins */}
        {CAIRO_LOCATIONS.map((loc) => {
          const p = toSvg(loc.lat, loc.lng, W, H);
          const isFrom = selectedFrom?.id === loc.id;
          const isTo = selectedTo?.id === loc.id;
          const active = isFrom || isTo;
          return (
            <g
              key={loc.id}
              transform={`translate(${p.x}, ${p.y})`}
              className={onPickLocation ? "cursor-pointer" : ""}
              onClick={() => onPickLocation?.(loc)}
            >
              <circle
                r={active ? 8 : 5}
                fill={
                  isFrom
                    ? "hsl(var(--success))"
                    : isTo
                    ? "hsl(var(--accent))"
                    : "hsl(var(--primary))"
                }
                stroke="white"
                strokeWidth="2"
              />
              <text
                y={-12}
                textAnchor="middle"
                fontSize="11"
                fontWeight={active ? 700 : 500}
                fill="hsl(var(--foreground))"
                style={{ paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 3 }}
              >
                {loc.name}
              </text>
            </g>
          );
        })}

        {/* User location */}
        {userLocation && (() => {
          const p = toSvg(userLocation.lat, userLocation.lng, W, H);
          return (
            <g transform={`translate(${p.x}, ${p.y})`}>
              <circle r="14" fill="hsl(var(--primary) / 0.25)">
                <animate attributeName="r" from="8" to="22" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle r="6" fill="hsl(var(--primary))" stroke="white" strokeWidth="2.5" />
            </g>
          );
        })()}
      </svg>

      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/85 backdrop-blur text-[10px] text-muted-foreground border border-border">
        <Navigation className="h-3 w-3" /> Cairo only
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-1 px-2 py-1.5 rounded-md bg-background/85 backdrop-blur text-[10px] border border-border">
        <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-success" /> From</span>
        <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-accent" /> To</span>
      </div>
    </div>
  );
};
