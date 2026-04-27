import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, Download } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, role, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  return (
    <AppShell title="Profile">
      <Card className="p-5 mt-2 bg-gradient-card">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{fullName || "Commuter"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          {role && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" /> {role}
            </Badge>
          )}
        </div>
      </Card>

      <div className="space-y-3 mt-5">
        <div>
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button onClick={save} disabled={saving} variant="hero" className="w-full">
          Save changes
        </Button>
      </div>

      <Button asChild variant="hero" className="w-full mt-8">
        <Link to="/install"><Download className="h-4 w-4" /> Install Basy app</Link>
      </Button>

      <Button variant="outline" className="w-full mt-3" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </AppShell>
  );
};

export default Profile;
