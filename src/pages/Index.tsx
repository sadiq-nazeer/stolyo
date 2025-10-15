import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { session, signOut, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session || !profile) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {profile.first_name || session.user.email}
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Your role is: <span className="font-semibold">{profile.role}</span>
        </p>
        <div className="space-y-4 flex flex-col items-center">
          <Button asChild size="lg" className="w-64">
            <Link to="/marketplace">Browse Marketplace</Link>
          </Button>
          <div className="flex space-x-4">
            <Button asChild variant="secondary">
              <Link to="/profile">My Profile</Link>
            </Button>
            {(profile.role === "vendor" || profile.role === "admin") && (
              <Button asChild variant="secondary">
                <Link to="/vendor/dashboard">Vendor Dashboard</Link>
              </Button>
            )}
            <Button onClick={signOut} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;