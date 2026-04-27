import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
  const text = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn("rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow", sizes[size])}>
        <Bus className="text-primary-foreground" style={{ width: "60%", height: "60%" }} />
      </div>
      <span className={cn("font-bold tracking-tight", text[size])}>Basy</span>
    </div>
  );
};
