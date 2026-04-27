import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Download, Smartphone, Share, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  // Detect if already running as installed PWA
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info("Use your browser menu to install — see the steps below.");
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      toast.success("Basy is installing on your device!");
    }
    setDeferredPrompt(null);
  };

  return (
    <AppShell title="Install Basy" subtitle="Add the app to your home screen">
      <Card className="p-6 mt-2 bg-gradient-hero text-primary-foreground text-center">
        <div className="flex justify-center mb-3">
          <Logo size="lg" className="[&_span]:text-primary-foreground" />
        </div>
        <p className="text-sm opacity-90">Get the full Basy experience — fast, offline-ready, with a real app icon on your phone.</p>
      </Card>

      {(installed || isStandalone) ? (
        <Card className="p-5 mt-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
          <p className="font-semibold">Basy is already installed</p>
          <p className="text-xs text-muted-foreground mt-1">Open it from your home screen anytime.</p>
        </Card>
      ) : (
        <>
          <Button variant="hero" size="xl" className="w-full mt-4" onClick={handleInstall}>
            <Download className="h-5 w-5" /> Install Basy
          </Button>

          {isIOS && (
            <Card className="p-4 mt-4">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> iPhone / iPad
              </p>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-5">
                <li>Tap the <Share className="inline h-3.5 w-3.5 mx-0.5" /> Share button in Safari</li>
                <li>Choose <strong>Add to Home Screen</strong> <Plus className="inline h-3.5 w-3.5" /></li>
                <li>Tap <strong>Add</strong> — Basy will appear on your home screen</li>
              </ol>
            </Card>
          )}

          {!isIOS && (
            <Card className="p-4 mt-4">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Android / Desktop
              </p>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-5">
                <li>Tap the install button above (if available)</li>
                <li>Or open your browser menu (⋮) and choose <strong>Install app</strong> / <strong>Add to Home Screen</strong></li>
                <li>Confirm — Basy will launch like a native app</li>
              </ol>
            </Card>
          )}
        </>
      )}

      <Card className="p-4 mt-3 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Why install?</strong> Faster launch, full-screen experience, works offline, and no browser bars.
        </p>
      </Card>
    </AppShell>
  );
};

export default Install;
