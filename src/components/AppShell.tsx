import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNav?: boolean;
}

export const AppShell = ({ children, title, subtitle, hideNav }: Props) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pb-20">
        {title && (
          <header className="px-5 pt-6 pb-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </header>
        )}
        <main className="px-5">{children}</main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};
