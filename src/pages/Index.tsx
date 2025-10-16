import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { session, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  const updateUserRole = async (role: "vendor" | "admin") => {
    if (!user) {
      showError("You must be logged in.");
      return;
    }
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user.id);

      if (error) throw error;

      showSuccess(`You are now a ${role}. The page will refresh.`);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      showError(err.message);
    }
  };

  if (!session || !profile) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {profile.first_name || session.user.email}
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Your role is: <span className="font-semibold">{profile.role}</span>
        </p>
        <div className="space-y-4 flex flex-col items-center">
          {profile.role === "vendor" && user && (
            <Button asChild size="lg" className="w-64">
              <Link to={`/store/${user.id}`}>View My Store</Link>
            </Button>
          )}
          {profile.role === "user" && (
            <p className="text-muted-foreground">
              This is the main landing page. In the future, we can add a
              directory of stores here!
            </p>
          )}
        </div>

        {/* Developer Tools */}
        <Card className="mt-12 text-left">
          <CardHeader>
            <CardTitle>Developer Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these buttons to assign a role to your current user for
              testing. The page will refresh after changing your role.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => updateUserRole("vendor")}
                disabled={profile.role === "vendor"}
              >
                Become a Vendor
              </Button>
              <Button
                variant="outline"
                onClick={() => updateUserRole("admin")}
                disabled={profile.role === "admin"}
              >
                Become an Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;