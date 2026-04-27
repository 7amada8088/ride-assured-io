import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Zap, Calendar, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-shuttle.jpg";

const features = [
  { icon: ShieldCheck, title: "Guaranteed seat", desc: "Book once, your seat is reserved. No standing, no surprises." },
  { icon: Zap, title: "No cancellations", desc: "Drivers can't cancel — system enforced. Your ride is locked in." },
  { icon: Calendar, title: "Subscriptions", desc: "Save up to 40% with weekly or monthly plans." },
  { icon: MapPin, title: "Fixed + dynamic routes", desc: "Daily commutes plus on-demand routes across Cairo." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Logo />
        <Link to="/auth"><Button variant="hero">Get started</Button></Link>
      </header>

      <main>
        <section className="px-5 py-12 md:py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Daily commute in Cairo, <span className="bg-gradient-primary bg-clip-text text-transparent">guaranteed</span>.
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Basy is a smart shuttle service for students and employees. Reserve your seat, subscribe to your route, and never worry about cancellations.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/auth"><Button variant="hero" size="xl">Start riding</Button></Link>
              <Link to="/auth"><Button variant="outline" size="xl">Sign in</Button></Link>
            </div>
          </div>
          <img src={heroImg} alt="Basy shuttle in Cairo" className="rounded-3xl shadow-elegant w-full" width={1536} height={1024} />
        </section>

        <section className="px-5 py-12 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Why Basy?</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-5 bg-gradient-card hover:shadow-elegant transition-base">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="px-5 py-10 text-center text-xs text-muted-foreground">
          © Basy — Smart commute platform.
        </footer>
      </main>
    </div>
  );
};

export default Index;
